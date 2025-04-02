/**
 * API Type Validation Script
 * 
 * This script validates MLB API type definitions against actual API responses
 * to identify discrepancies and potential issues.
 */

import * as fs from 'fs';
import * as path from 'path';
import { inspect } from 'util';
import * as ts from 'typescript';

// Configure paths
const API_SAMPLES_DIR = path.join(process.cwd(), 'data', 'api-samples');
const API_TYPES_DIR = path.join(process.cwd(), 'lib', 'mlb', 'types', 'api');
const VALIDATION_REPORT_PATH = path.join(process.cwd(), 'logs', 'api-type-validation.log');

// Map of API sample files to their corresponding type interfaces
const API_TYPE_MAPPINGS: Record<string, string[]> = {
  'game_feed': ['GameFeedApiResponse', 'GameData', 'LiveData'],
  'player_batter': ['BatterApiResponse', 'BatterSeasonApiStats'],
  'player_pitcher': ['PitcherApiResponse', 'PitcherSeasonApiStats'],
  'schedule_today': ['ScheduleApiResponse', 'GameDate'],
  'weather_game': ['GameEnvironmentApiResponse']
};

// Helper to extract interface name from file content
function extractInterfaceNames(fileContent: string): string[] {
  const regex = /export\s+interface\s+(\w+)/g;
  const interfaces: string[] = [];
  let match;
  
  while ((match = regex.exec(fileContent)) !== null) {
    interfaces.push(match[1]);
  }
  
  return interfaces;
}

// Function to get TypeScript interface properties
function getInterfaceProperties(sourceFile: ts.SourceFile, interfaceName: string): string[] {
  const properties: string[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      node.members.forEach(member => {
        if (ts.isPropertySignature(member) && member.name) {
          if (ts.isIdentifier(member.name)) {
            properties.push(member.name.text);
          }
        }
      });
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return properties;
}

// Load type definitions
function loadTypeDefinitions(): Record<string, string[]> {
  const typeFiles = fs.readdirSync(API_TYPES_DIR).filter(file => file.endsWith('.ts'));
  const types: Record<string, string[]> = {};
  
  typeFiles.forEach(file => {
    const filePath = path.join(API_TYPES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const interfaces = extractInterfaceNames(content);
    
    // Create AST
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    
    interfaces.forEach(interfaceName => {
      const properties = getInterfaceProperties(sourceFile, interfaceName);
      types[interfaceName] = properties;
    });
  });
  
  return types;
}

// Parse JSON sample files
function loadSampleData(): Record<string, any> {
  const sampleFiles = fs.readdirSync(API_SAMPLES_DIR)
    .filter(file => file.endsWith('.json'));
  
  const samples: Record<string, any> = {};
  
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

// Extract all properties from a JSON object (recursively)
function extractJsonProperties(obj: any, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return [];
  
  let properties: string[] = [];
  
  Object.keys(obj).forEach(key => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    properties.push(fullPath);
    
    // Handle arrays
    if (Array.isArray(obj[key]) && obj[key].length > 0 && typeof obj[key][0] === 'object') {
      properties = [...properties, ...extractJsonProperties(obj[key][0], `${fullPath}[0]`)];
    } 
    // Handle nested objects
    else if (obj[key] && typeof obj[key] === 'object') {
      properties = [...properties, ...extractJsonProperties(obj[key], fullPath)];
    }
  });
  
  return properties;
}

// Compare type definitions with sample data
function validateTypes(types: Record<string, string[]>, samples: Record<string, any[]>): string[] {
  const validationIssues: string[] = [];
  
  // For each API endpoint type
  Object.keys(API_TYPE_MAPPINGS).forEach(sampleType => {
    if (!samples[sampleType] || samples[sampleType].length === 0) {
      validationIssues.push(`No sample data found for ${sampleType}`);
      return;
    }
    
    const interfaceNames = API_TYPE_MAPPINGS[sampleType];
    interfaceNames.forEach(interfaceName => {
      if (!types[interfaceName]) {
        validationIssues.push(`Interface ${interfaceName} not found in type definitions`);
        return;
      }
      
      // Get properties from the interface
      const interfaceProps = types[interfaceName];
      
      // For each sample of this type
      samples[sampleType].forEach((sample, index) => {
        // For game_feed, we need to check the response property
        let sampleData = sample.response || sample;
        
        // Special handling for nested types
        if (interfaceName === 'GameData' && sampleData.gameData) {
          sampleData = sampleData.gameData;
        } else if (interfaceName === 'LiveData' && sampleData.liveData) {
          sampleData = sampleData.liveData;
        } else if (interfaceName === 'BatterSeasonApiStats' && sampleData.seasonStats) {
          sampleData = sampleData.seasonStats;
        } else if (interfaceName === 'PitcherSeasonApiStats' && sampleData.seasonStats) {
          sampleData = sampleData.seasonStats;
        } else if (interfaceName === 'GameDate' && sampleData.dates && sampleData.dates.length > 0) {
          sampleData = sampleData.dates[0];
        }
        
        // Extract properties from the sample
        const sampleProps = extractJsonProperties(sampleData);
        const topLevelSampleProps = Object.keys(sampleData);
        
        // Check for properties in sample but not in interface
        const missingInInterface = topLevelSampleProps.filter(prop => 
          !interfaceProps.includes(prop) && 
          !['response', 'endpoint', 'timestamp', 'sourceTimestamp', '__isApiSource', 'copyright'].includes(prop)
        );
        
        if (missingInInterface.length > 0) {
          validationIssues.push(`Properties found in ${sampleType} sample ${index} but missing in ${interfaceName}:\n  ${missingInInterface.join(', ')}`);
        }
        
        // Check for type mismatches (simple case)
        topLevelSampleProps.forEach(prop => {
          if (interfaceProps.includes(prop)) {
            const value = sampleData[prop];
            
            // Special checks for known issues
            if (prop === 'teams' && interfaceName === 'GameData') {
              if (!value || typeof value !== 'object') {
                validationIssues.push(`Type mismatch in ${interfaceName}.${prop}: expected object got ${typeof value}`);
              }
            }
            
            // Check for objects defined as strings
            if ((prop === 'batSide' || prop === 'pitchHand') && typeof value === 'object') {
              validationIssues.push(`Type mismatch in ${interfaceName}.${prop}: defined as string but actually an object with keys ${Object.keys(value).join(', ')}`);
            }
          }
        });
      });
    });
  });
  
  return validationIssues;
}

// Main validation function
async function validateApiTypes(): Promise<void> {
  console.log('Loading type definitions...');
  const types = loadTypeDefinitions();
  
  console.log('Loading sample data...');
  const samples = loadSampleData();
  
  console.log('Validating types against sample data...');
  const validationIssues = validateTypes(types, samples);
  
  // Generate validation report
  const report = [
    '--- MLB API Type Validation Report ---',
    `Generated on: ${new Date().toLocaleString()}`,
    '',
    `Type definitions analyzed: ${Object.keys(types).length}`,
    `Sample files analyzed: ${Object.keys(samples).reduce((sum, key) => sum + samples[key].length, 0)}`,
    `Issues found: ${validationIssues.length}`,
    '',
    '--- Issues ---',
    '',
    ...validationIssues,
    '',
    '--- Type Definitions Summary ---',
    '',
    ...Object.keys(types).map(type => `${type}: ${types[type].length} properties`)
  ].join('\n');
  
  // Save validation report
  fs.writeFileSync(VALIDATION_REPORT_PATH, report);
  
  // Print summary
  console.log(`Validation complete. Found ${validationIssues.length} issues.`);
  console.log(`Full report saved to: ${VALIDATION_REPORT_PATH}`);
  
  // Print first few issues as a preview
  if (validationIssues.length > 0) {
    console.log('\nIssues preview:');
    validationIssues.slice(0, 5).forEach(issue => console.log(`- ${issue}`));
    if (validationIssues.length > 5) {
      console.log(`... and ${validationIssues.length - 5} more issues.`);
    }
  }
}

// Run validation
validateApiTypes().catch(error => {
  console.error('Error validating API types:', error);
  process.exit(1);
});