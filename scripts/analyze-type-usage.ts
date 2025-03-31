/**
 * Type Usage Analysis Tool
 * 
 * This script analyzes the usage of types across the codebase to identify
 * mismatches between type definitions and actual implementation.
 * 
 * Usage:
 * pnpm ts-node scripts/analyze-type-usage.ts
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

// Configuration
const MLB_TYPES_DIR = path.resolve(__dirname, '../lib/mlb/types');
const MLB_CODE_DIR = path.resolve(__dirname, '../lib/mlb');
const OUTPUT_FILE = path.resolve(__dirname, '../knowledge/type-usage-analysis.md');

interface TypeInfo {
  name: string;
  filePath: string;
  properties: Map<string, string>; // property name -> type
}

interface TypeUsage {
  typeInfo: TypeInfo;
  usages: {
    filePath: string;
    actualProperties: Set<string>;
    missingProperties: Set<string>;
    extraProperties: Set<string>;
  }[];
}

// Map to store interface definitions
const interfaces = new Map<string, TypeInfo>();

function getInterfaceProperties(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): Map<string, string> {
  const properties = new Map<string, string>();
  
  node.members.forEach(member => {
    if (ts.isPropertySignature(member) && member.name) {
      const propertyName = member.name.getText(sourceFile);
      const propertyType = member.type ? member.type.getText(sourceFile) : 'any';
      properties.set(propertyName, propertyType);
    }
  });

  return properties;
}

function extractInterfaces(filePath: string): void {
  const sourceContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceContent,
    ts.ScriptTarget.Latest,
    true
  );

  function visitNode(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.text;
      const properties = getInterfaceProperties(node, sourceFile);
      
      interfaces.set(interfaceName, {
        name: interfaceName,
        filePath,
        properties,
      });
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
}

function findObjectCreationsForInterface(interfaceName: string, filePath: string): Set<string>[] {
  const sourceContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceContent,
    ts.ScriptTarget.Latest,
    true
  );

  const propertyAccesses = new Set<string>();
  const objectCreations = new Set<string>();
  let foundUsage = false;

  function visitNode(node: ts.Node) {
    // Look for variable declarations that reference our interface
    if (ts.isVariableDeclaration(node) && node.type) {
      if (node.type.getText(sourceFile).includes(interfaceName)) {
        foundUsage = true;
      }
    }
    
    // Look for function parameters or return types that reference our interface
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      if (node.type && node.type.getText(sourceFile).includes(interfaceName)) {
        foundUsage = true;
      }
      
      if (node.parameters) {
        for (const param of node.parameters) {
          if (param.type && param.type.getText(sourceFile).includes(interfaceName)) {
            foundUsage = true;
          }
        }
      }
    }

    // Capture object literal properties when creating objects
    if (ts.isObjectLiteralExpression(node)) {
      const parent = node.parent;
      
      // Only consider object literals that might be typed as our interface
      if (foundUsage) {
        for (const property of node.properties) {
          if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
            objectCreations.add(property.name.text);
          }
        }
      }
    }

    // Capture property accesses that might be using our interface
    if (ts.isPropertyAccessExpression(node)) {
      if (foundUsage && ts.isIdentifier(node.name)) {
        propertyAccesses.add(node.name.text);
      }
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
  return [propertyAccesses, objectCreations];
}

function findAllFilesWithExtension(dir: string, ext: string): string[] {
  const results: string[] = [];
  
  function traverse(currentDir: string) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverse(filePath);
      } else if (file.endsWith(ext)) {
        results.push(filePath);
      }
    }
  }
  
  traverse(dir);
  return results;
}

function analyzeCombinedUsage(interfaceName: string): TypeUsage | null {
  const typeInfo = interfaces.get(interfaceName);
  if (!typeInfo) return null;

  const usages: TypeUsage['usages'] = [];
  const codeFiles = findAllFilesWithExtension(MLB_CODE_DIR, '.ts');
  
  for (const filePath of codeFiles) {
    if (filePath.includes('/types/')) continue; // Skip type definitions
    
    try {
      const [propertyAccesses, objectCreations] = findObjectCreationsForInterface(interfaceName, filePath);
      const actualProperties = new Set([...propertyAccesses, ...objectCreations]);
      
      if (actualProperties.size > 0) {
        const typeProperties = new Set(typeInfo.properties.keys());
        
        // Find missing properties (in type but not used in code)
        const missingProperties = new Set<string>();
        for (const prop of typeProperties) {
          if (!actualProperties.has(prop)) {
            missingProperties.add(prop);
          }
        }
        
        // Find extra properties (used in code but not in type)
        const extraProperties = new Set<string>();
        for (const prop of actualProperties) {
          if (!typeProperties.has(prop)) {
            extraProperties.add(prop);
          }
        }
        
        usages.push({
          filePath,
          actualProperties,
          missingProperties,
          extraProperties,
        });
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
  
  return {
    typeInfo,
    usages,
  };
}

function generateReport(analysisResults: TypeUsage[]): string {
  let report = `# Type Usage Analysis Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total interfaces analyzed: ${interfaces.size}\n`;
  report += `- Interfaces with usage mismatches: ${analysisResults.length}\n\n`;
  
  report += `## Detailed Analysis\n\n`;
  
  for (const result of analysisResults) {
    const { typeInfo, usages } = result;
    
    if (usages.length === 0) continue;
    
    report += `### ${typeInfo.name}\n\n`;
    report += `Defined in: \`${path.relative(process.cwd(), typeInfo.filePath)}\`\n\n`;
    report += `Properties (${typeInfo.properties.size}):\n`;
    
    // List all properties in the interface
    for (const [propName, propType] of typeInfo.properties.entries()) {
      report += `- \`${propName}: ${propType}\`\n`;
    }
    
    report += `\n#### Usage Mismatches\n\n`;
    
    // Get total mismatch count
    let totalExtraProps = 0;
    let totalMissingProps = 0;
    usages.forEach(usage => {
      totalExtraProps += usage.extraProperties.size;
      totalMissingProps += usage.missingProperties.size;
    });
    
    report += `- Extra properties (not in type definition): ${totalExtraProps}\n`;
    report += `- Unused properties (defined but not used): ${totalMissingProps}\n\n`;
    
    // Detail each file with mismatches
    for (const usage of usages) {
      if (usage.extraProperties.size > 0 || usage.missingProperties.size > 0) {
        report += `**File**: \`${path.relative(process.cwd(), usage.filePath)}\`\n\n`;
        
        if (usage.extraProperties.size > 0) {
          report += `Extra properties:\n`;
          for (const prop of usage.extraProperties) {
            report += `- \`${prop}\`\n`;
          }
          report += `\n`;
        }
        
        if (usage.missingProperties.size > 0) {
          report += `Unused properties:\n`;
          for (const prop of usage.missingProperties) {
            report += `- \`${prop}\`\n`;
          }
          report += `\n`;
        }
      }
    }
    
    report += `---\n\n`;
  }
  
  report += `## Recommendations\n\n`;
  report += `1. Update interface definitions to include all properties used in code\n`;
  report += `2. Consider making rarely used properties optional with the \`?\` modifier\n`;
  report += `3. Use type composition (\`Type1 & Type2\`) instead of inheritance for specialized cases\n`;
  report += `4. Consider creating more granular interfaces for specific contexts\n`;
  report += `5. Add runtime validation for critical properties\n`;
  
  return report;
}

async function main() {
  console.log('Analyzing type definitions...');
  const typeFiles = findAllFilesWithExtension(MLB_TYPES_DIR, '.ts');
  
  for (const filePath of typeFiles) {
    try {
      extractInterfaces(filePath);
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
  
  console.log(`Found ${interfaces.size} interfaces in type definitions`);
  
  const analysisResults: TypeUsage[] = [];
  
  for (const interfaceName of interfaces.keys()) {
    const result = analyzeCombinedUsage(interfaceName);
    if (result && result.usages.length > 0) {
      analysisResults.push(result);
    }
  }
  
  console.log(`Found ${analysisResults.length} interfaces with usage mismatches`);
  
  const report = generateReport(analysisResults);
  fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
  
  console.log(`Analysis complete. Report saved to ${OUTPUT_FILE}`);
}

main().catch(error => {
  console.error('Error running analysis:', error);
  process.exit(1);
});