/**
 * Data Sample Extractor for Type Validation
 * 
 * This script extracts real data samples from the MLB API responses and
 * local data files to use for validating type definitions.
 * 
 * Usage:
 * pnpm ts-node scripts/extract-data-samples.ts
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const DATA_DIR = path.resolve(__dirname, '../data');
const OUTPUT_DIR = path.resolve(__dirname, '../data/type-samples');
const MAX_SAMPLES_PER_TYPE = 3; // Limit number of samples per type

interface DataSample {
  source: string;
  timestamp: string;
  data: unknown;
}

interface TypeSample {
  typename: string;
  samples: DataSample[];
  properties: Set<string>;
}

// Make sure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to detect the probable type of an object
function detectObjectType(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return 'unknown';
  }

  if (typeof obj !== 'object') {
    return typeof obj;
  }

  // For arrays, look at the first element to determine type
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'Array<unknown>';
    return `Array<${detectObjectType(obj[0])}>`;
  }

  // Try to identify common types based on properties
  const objKeys = new Set(Object.keys(obj));
  
  if (objKeys.has('batterId') || objKeys.has('batterID')) {
    return 'BatterData';
  }
  
  if (objKeys.has('pitcherId') || objKeys.has('pitcherID')) {
    return 'PitcherData';
  }
  
  if (objKeys.has('gameId') || objKeys.has('gamePk')) {
    return 'GameData';
  }

  if (objKeys.has('temperature') && objKeys.has('windSpeed')) {
    return 'WeatherData';
  }

  if (objKeys.has('venue') && objKeys.has('homeTeam')) {
    return 'GameEnvironmentData';
  }

  if (objKeys.has('hits') && objKeys.has('atBats') && objKeys.has('avg')) {
    return 'BatterStats';
  }

  if (objKeys.has('inningsPitched') && objKeys.has('strikeouts') && objKeys.has('era')) {
    return 'PitcherStats';
  }

  // If we can't detect a specific type, return a hash of the keys to group similar objects
  const keyString = Array.from(objKeys).sort().join(',');
  const keyHash = createHash('md5').update(keyString).digest('hex').substring(0, 8);
  return `UnknownType_${keyHash}`;
}

// Extract all properties recursively from an object
function extractAllProperties(obj: unknown, prefix = ''): Set<string> {
  const properties = new Set<string>();
  
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return properties;
  }

  for (const [key, value] of Object.entries(obj)) {
    const propertyPath = prefix ? `${prefix}.${key}` : key;
    properties.add(propertyPath);
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively extract properties from nested objects
      const nestedProperties = extractAllProperties(value, propertyPath);
      for (const nestedProp of nestedProperties) {
        properties.add(nestedProp);
      }
    }
  }
  
  return properties;
}

// Process JSON files to extract data samples
function processJsonFiles(): Map<string, TypeSample> {
  const typeSamples = new Map<string, TypeSample>();
  
  function processFile(filePath: string) {
    try {
      console.log(`Processing ${filePath}...`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const source = path.relative(process.cwd(), filePath);
      const timestamp = new Date().toISOString();
      
      // For array data, process each element
      if (Array.isArray(data)) {
        for (const item of data) {
          processDataItem(item, source, timestamp);
        }
      } 
      // For object with multiple sections, process each section
      else if (data && typeof data === 'object') {
        // First try processing the whole object
        processDataItem(data, source, timestamp);
        
        // Then process each top-level property if it's an array or object
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === 'object') {
            if (Array.isArray(value)) {
              for (const item of value) {
                processDataItem(item, `${source}#${key}`, timestamp);
              }
            } else {
              processDataItem(value, `${source}#${key}`, timestamp);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  function processDataItem(item: unknown, source: string, timestamp: string) {
    if (!item || typeof item !== 'object') return;
    
    const typename = detectObjectType(item);
    const properties = extractAllProperties(item);
    
    if (!typeSamples.has(typename)) {
      typeSamples.set(typename, {
        typename,
        samples: [],
        properties: new Set<string>()
      });
    }
    
    const typeSample = typeSamples.get(typename)!;
    
    // Add properties
    for (const prop of properties) {
      typeSample.properties.add(prop);
    }
    
    // Add sample if we haven't reached the limit
    if (typeSample.samples.length < MAX_SAMPLES_PER_TYPE) {
      typeSample.samples.push({
        source,
        timestamp,
        data: item
      });
    }
  }
  
  // Walk through all JSON files in the data directory
  function walkDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDirectory(fullPath);
      } else if (entry.name.endsWith('.json')) {
        processFile(fullPath);
      }
    }
  }
  
  walkDirectory(DATA_DIR);
  return typeSamples;
}

// Generate documentation from the extracted samples
function generateDocumentation(typeSamples: Map<string, TypeSample>): string {
  let documentation = `# Data Type Samples for Validation\n\n`;
  documentation += `Generated on: ${new Date().toLocaleString()}\n\n`;
  documentation += `This document contains real data samples extracted from API responses and local data files.\n`;
  documentation += `Use these samples to validate type definitions.\n\n`;
  
  documentation += `## Summary\n\n`;
  documentation += `Total detected types: ${typeSamples.size}\n\n`;
  
  // Sort types by name for readability
  const sortedTypes = Array.from(typeSamples.values()).sort((a, b) => 
    a.typename.localeCompare(b.typename)
  );
  
  documentation += `## Detected Types\n\n`;
  
  for (const typeSample of sortedTypes) {
    documentation += `### ${typeSample.typename}\n\n`;
    documentation += `Samples: ${typeSample.samples.length}\n\n`;
    
    documentation += `#### Properties (${typeSample.properties.size})\n\n`;
    
    // Sort properties for readability
    const sortedProperties = Array.from(typeSample.properties).sort();
    for (const property of sortedProperties) {
      documentation += `- \`${property}\`\n`;
    }
    
    documentation += `\n#### Sample Sources\n\n`;
    for (const sample of typeSample.samples) {
      documentation += `- ${sample.source}\n`;
    }
    
    documentation += `\n#### Sample Definition\n\n`;
    documentation += `\`\`\`typescript\n`;
    documentation += `export interface ${typeSample.typename.replace(/[^a-zA-Z0-9_]/g, '_')} {\n`;
    
    // Generate properties with types based on the first sample
    if (typeSample.samples.length > 0) {
      const sample = typeSample.samples[0].data;
      for (const property of sortedProperties) {
        const parts = property.split('.');
        let value = sample;
        let optional = false;
        
        // Navigate to the property
        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part as keyof typeof value];
          } else {
            value = undefined;
            optional = true;
            break;
          }
        }
        
        const simpleProp = parts[parts.length - 1];
        const type = value === null 
          ? 'null' 
          : Array.isArray(value)
            ? 'any[]' // Simplified for demonstration
            : typeof value;
            
        documentation += `  ${simpleProp}${optional ? '?' : ''}: ${type};\n`;
      }
    }
    
    documentation += `}\n\`\`\`\n\n`;
    
    documentation += `---\n\n`;
  }
  
  return documentation;
}

// Save individual samples as JSON files
function saveSampleFiles(typeSamples: Map<string, TypeSample>): void {
  for (const [typename, sample] of typeSamples.entries()) {
    // Create a safe filename from the type name
    const safeTypename = typename.replace(/[^a-zA-Z0-9_]/g, '_');
    const outputPath = path.join(OUTPUT_DIR, `${safeTypename}.json`);
    
    // Save the sample data
    fs.writeFileSync(
      outputPath, 
      JSON.stringify(
        {
          typename,
          properties: Array.from(sample.properties),
          samples: sample.samples
        }, 
        null, 
        2
      )
    );
    
    console.log(`Saved sample for ${typename} to ${outputPath}`);
  }
}

// Main execution
function main() {
  console.log('Extracting data samples from JSON files...');
  const typeSamples = processJsonFiles();
  console.log(`Found ${typeSamples.size} distinct data types`);
  
  // Generate and save documentation
  const documentation = generateDocumentation(typeSamples);
  const docPath = path.join(OUTPUT_DIR, 'README.md');
  fs.writeFileSync(docPath, documentation, 'utf-8');
  console.log(`Documentation saved to ${docPath}`);
  
  // Save individual sample files
  saveSampleFiles(typeSamples);
  
  console.log('Data sample extraction complete');
}

main();