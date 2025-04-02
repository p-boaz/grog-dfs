/**
 * API Response Analyzer
 * 
 * This script analyzes a single API response file and generates a detailed report
 * about its structure, helping to ensure type definitions match reality.
 */

import * as fs from 'fs';
import * as path from 'path';
import { inspect } from 'util';

// Function to deeply analyze the structure of an object
function analyzeStructure(obj: any, prefix = ''): string[] {
  if (obj === null) return [`${prefix}: null`];
  if (obj === undefined) return [`${prefix}: undefined`];
  
  const type = Array.isArray(obj) ? 'array' : typeof obj;
  
  if (type === 'object') {
    const results = [`${prefix}: object {`];
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        results.push(`  ${newPrefix}: ${value === null ? 'null' : 'undefined'}`);
      }
      else if (typeof value !== 'object') {
        results.push(`  ${newPrefix}: ${typeof value} (${value === '' ? 'empty string' : value})`);
      }
      else {
        const nestedResults = analyzeStructure(value, newPrefix).map(line => `  ${line}`);
        results.push(...nestedResults);
      }
    });
    results.push('}');
    return results;
  }
  
  if (type === 'array') {
    if (obj.length === 0) {
      return [`${prefix}: empty array []`];
    }
    
    const sample = obj[0];
    const results = [`${prefix}: array[${obj.length}] {`];
    if (typeof sample !== 'object' || sample === null) {
      results.push(`  items: ${typeof sample}[]`);
    } else {
      const nestedResults = analyzeStructure(sample, `${prefix}[0]`).map(line => `  ${line}`);
      results.push(...nestedResults);
    }
    results.push('}');
    return results;
  }
  
  return [`${prefix}: ${type} (${obj})`];
}

// Function to suggest TypeScript interface
function suggestInterface(obj: any, name: string): string[] {
  const lines = ['/**', ` * Interface for ${name}`, ' */'];
  lines.push(`export interface ${name} {`);
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    // Skip metadata properties for clarity
    if (['endpoint', 'timestamp', 'sourceTimestamp', '__isApiSource', 'copyright'].includes(key)) {
      return;
    }
    
    let type: string;
    if (value === null) {
      type = 'null';
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        type = 'any[]';
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        type = `Array<${name}${key.charAt(0).toUpperCase() + key.slice(1)}Item>`;
      } else {
        type = `${typeof value[0]}[]`;
      }
    } else if (typeof value === 'object') {
      type = `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`;
    } else {
      type = typeof value;
    }
    
    lines.push(`  ${key}: ${type};`);
  });
  
  lines.push('}');
  
  // Generate sub-interfaces for nested objects
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const itemInterface = suggestInterface(value[0], `${name}${key.charAt(0).toUpperCase() + key.slice(1)}Item`);
      lines.push('', ...itemInterface);
    }
    else if (typeof value === 'object' && value !== null) {
      const nestedInterface = suggestInterface(value, `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`);
      lines.push('', ...nestedInterface);
    }
  });
  
  return lines;
}

// Main function to analyze an API response file
async function analyzeApiResponse(filePath: string) {
  // Verify the file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  // Read and parse the file
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  // Extract filename for the report
  const fileName = path.basename(filePath);
  
  // Extract API endpoint from the data or filename
  const endpoint = data.endpoint || fileName.split('-')[0];
  
  // Generate output filename
  const outputPath = path.join(
    path.dirname(filePath), 
    `${fileName.replace('.json', '')}-analysis.md`
  );
  
  // Get the actual response data
  const responseData = data.response || data;
  
  // Analyze structure
  const structureAnalysis = analyzeStructure(responseData);
  
  // Suggest TypeScript interfaces
  const interfaceName = endpoint
    .split('/')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '') + 'Response';
  
  const suggestedInterfaces = suggestInterface(responseData, interfaceName);
  
  // Generate report
  const report = [
    `# API Response Analysis: ${endpoint}`,
    '',
    `Analysis of \`${fileName}\` generated on ${new Date().toLocaleString()}`,
    '',
    '## Structure',
    '',
    '```',
    ...structureAnalysis,
    '```',
    '',
    '## Suggested TypeScript Interfaces',
    '',
    '```typescript',
    ...suggestedInterfaces,
    '```',
  ].join('\n');
  
  // Write report
  fs.writeFileSync(outputPath, report);
  
  console.log(`Analysis complete! Report saved to: ${outputPath}`);
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a path to an API response JSON file');
  console.log('Usage: pnpm tsx scripts/analyze-api-response.ts path/to/response.json');
  process.exit(1);
}

// Run the analyzer on the specified file
analyzeApiResponse(args[0]);