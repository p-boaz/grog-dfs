/**
 * API Type Update Script
 * 
 * This script analyzes sample API responses and updates type definitions
 * to ensure they match the actual structure from the MLB API.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Configure paths
const API_SAMPLES_DIR = path.join(process.cwd(), 'data', 'api-samples');
const API_TYPES_DIR = path.join(process.cwd(), 'lib', 'mlb', 'types', 'api');
const UPDATE_REPORT_PATH = path.join(process.cwd(), 'logs', 'api-type-updates.log');

// Map of API sample files to their corresponding type files and interfaces
const API_TYPE_MAPPINGS: Record<string, { file: string, interfaces: string[] }> = {
  'game_feed': { 
    file: 'game.ts', 
    interfaces: ['GameFeedApiResponse', 'GameData', 'LiveData', 'GameTeams'] 
  },
  'player_batter': { 
    file: 'player.ts', 
    interfaces: ['BatterApiResponse', 'BatterSeasonApiStats'] 
  },
  'player_pitcher': { 
    file: 'player.ts', 
    interfaces: ['PitcherApiResponse', 'PitcherSeasonApiStats'] 
  },
  'schedule_today': { 
    file: 'game.ts', 
    interfaces: ['ScheduleApiResponse', 'GameDate'] 
  },
  'weather_game': { 
    file: 'game.ts', 
    interfaces: ['GameEnvironmentApiResponse'] 
  }
};

// Parse JSON sample files
function loadSampleData(): Record<string, any[]> {
  const sampleFiles = fs.readdirSync(API_SAMPLES_DIR)
    .filter(file => file.endsWith('.json'));
  
  const samples: Record<string, any[]> = {};
  
  sampleFiles.forEach(file => {
    const filePath = path.join(API_SAMPLES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Extract API endpoint type from filename
    const baseType = Object.keys(API_TYPE_MAPPINGS).find(type => file.includes(type));
    if (baseType) {
      if (!samples[baseType]) {
        samples[baseType] = [];
      }
      samples[baseType].push(data);
    }
  });
  
  return samples;
}

// Determine property type from a sample value
function determineType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    const itemType = determineType(value[0]);
    return `${itemType}[]`;
  }
  if (typeof value === 'object') {
    return 'Record<string, any>'; // For simplicity, could be expanded
  }
  return typeof value;
}

// Generate TS interface for a sample object
function generateInterface(name: string, sample: any): string {
  const properties: string[] = [];
  
  Object.keys(sample).forEach(key => {
    // Skip metadata properties
    if (['endpoint', 'timestamp', 'sourceTimestamp', '__isApiSource', 'copyright'].includes(key)) {
      return;
    }
    
    const value = sample[key];
    const type = determineType(value);
    properties.push(`  ${key}: ${type};`);
  });
  
  return [
    `export interface ${name} {`,
    ...properties,
    '}'
  ].join('\n');
}

// Update a specific type definition file with new interfaces
function updateTypeDefinition(
  typeFile: string, 
  interfaces: Record<string, string>
): void {
  const filePath = path.join(API_TYPES_DIR, typeFile);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`Creating new type file: ${typeFile}`);
    
    const fileContent = [
      '/**',
      ' * MLB API Type Definitions',
      ' * Auto-generated from sample data',
      ` * Generated on: ${new Date().toLocaleString()}`,
      ' */',
      '',
      ...Object.values(interfaces),
      ''
    ].join('\n');
    
    fs.writeFileSync(filePath, fileContent);
    return;
  }
  
  // Read existing file
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Process the file using TypeScript AST
  const sourceFile = ts.createSourceFile(
    typeFile,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Create TypeScript printer
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });
  
  // Find existing interfaces and update them
  const updatedContent = ts.transform(sourceFile, [
    context => {
      return node => {
        if (ts.isInterfaceDeclaration(node) && 
            interfaces[node.name.text]) {
          // We found an interface to update
          console.log(`Updating interface: ${node.name.text}`);
          
          // Parse the new interface
          const newInterfaceText = interfaces[node.name.text];
          const tempSourceFile = ts.createSourceFile(
            'temp.ts',
            newInterfaceText,
            ts.ScriptTarget.Latest,
            true
          );
          
          // Find the interface in the temporary source file
          let newInterface: ts.InterfaceDeclaration | undefined;
          ts.forEachChild(tempSourceFile, child => {
            if (ts.isInterfaceDeclaration(child) && 
                child.name.text === node.name.text) {
              newInterface = child;
            }
          });
          
          if (newInterface) {
            // Return the updated interface
            delete interfaces[node.name.text]; // Mark as processed
            return newInterface;
          }
        }
        return node;
      };
    }
  ]).transformed[0];
  
  // Write back the updated content
  const updatedText = printer.printFile(updatedContent as ts.SourceFile);
  
  // Append any new interfaces that weren't updates
  const newInterfaces = Object.values(interfaces).join('\n\n');
  const finalContent = newInterfaces ? `${updatedText}\n\n${newInterfaces}` : updatedText;
  
  fs.writeFileSync(filePath, finalContent);
}

// Generate updated types from sample data
async function updateApiTypes(): Promise<void> {
  console.log('Loading sample data...');
  const samples = loadSampleData();
  
  const updatedFiles: string[] = [];
  const updateLog: string[] = [];
  
  // For each API endpoint type
  for (const sampleType of Object.keys(API_TYPE_MAPPINGS)) {
    if (!samples[sampleType] || samples[sampleType].length === 0) {
      updateLog.push(`No sample data found for ${sampleType}`);
      continue;
    }
    
    const { file, interfaces } = API_TYPE_MAPPINGS[sampleType];
    const interfaceUpdates: Record<string, string> = {};
    
    // For each sample of this type
    for (const sample of samples[sampleType]) {
      // Get the actual data (may be in response property)
      const sampleData = sample.response || sample;
      
      for (const interfaceName of interfaces) {
        // Special handling for nested types
        let dataToAnalyze = sampleData;
        
        if (interfaceName === 'GameData' && sampleData.gameData) {
          dataToAnalyze = sampleData.gameData;
        } else if (interfaceName === 'LiveData' && sampleData.liveData) {
          dataToAnalyze = sampleData.liveData;
        } else if (interfaceName === 'GameTeams' && sampleData.gameData?.teams) {
          dataToAnalyze = sampleData.gameData.teams;
        } else if (interfaceName === 'BatterSeasonApiStats' && sampleData.seasonStats) {
          dataToAnalyze = sampleData.seasonStats;
        } else if (interfaceName === 'PitcherSeasonApiStats' && sampleData.seasonStats) {
          dataToAnalyze = sampleData.seasonStats;
        } else if (interfaceName === 'GameDate' && sampleData.dates && sampleData.dates.length > 0) {
          dataToAnalyze = sampleData.dates[0];
        }
        
        // Generate interface
        const updatedInterface = generateInterface(interfaceName, dataToAnalyze);
        interfaceUpdates[interfaceName] = updatedInterface;
      }
    }
    
    // Update the type definition file
    try {
      updateTypeDefinition(file, interfaceUpdates);
      updatedFiles.push(file);
      updateLog.push(`Updated interfaces in ${file}: ${Object.keys(interfaceUpdates).join(', ')}`);
    } catch (error) {
      updateLog.push(`Error updating ${file}: ${error}`);
    }
  }
  
  // Generate update report
  const report = [
    '--- MLB API Type Update Report ---',
    `Generated on: ${new Date().toLocaleString()}`,
    '',
    `Files updated: ${updatedFiles.length}`,
    '',
    '--- Update Log ---',
    '',
    ...updateLog
  ].join('\n');
  
  // Save update report
  fs.writeFileSync(UPDATE_REPORT_PATH, report);
  
  // Print summary
  console.log(`Type update complete. Updated ${updatedFiles.length} files.`);
  console.log(`Full report saved to: ${UPDATE_REPORT_PATH}`);
}

// Run update
updateApiTypes().catch(error => {
  console.error('Error updating API types:', error);
  process.exit(1);
});