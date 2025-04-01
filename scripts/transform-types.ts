/**
 * Type Transformation Utility
 *
 * This script helps transform and migrate type definitions.
 * It can:
 * 1. Find duplicate types with similar properties
 * 2. Generate adaptors between similar types
 * 3. Create unified types from multiple related types
 *
 * Usage:
 * pnpm tsx scripts/transform-types.ts
 */

import fs from "fs";
import path from "path";
import ts from "typescript";

// Configuration
const MLB_TYPES_DIR = path.resolve(__dirname, "../lib/mlb/types");
const OUTPUT_DIR = path.resolve(__dirname, "../lib/mlb/types/migration");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface TypeInfo {
  name: string;
  filePath: string;
  properties: Map<string, string>; // property name -> type
  text: string; // Full original text
}

// Helper to extract interface information
function extractInterfaceInfo(filePath: string): TypeInfo[] {
  const results: TypeInfo[] = [];
  const sourceText = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  function visitNode(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.text;
      const properties = new Map<string, string>();

      node.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const propertyName = member.name.getText(sourceFile);
          const propertyType = member.type
            ? member.type.getText(sourceFile)
            : "any";
          properties.set(propertyName, propertyType);
        }
      });

      results.push({
        name: interfaceName,
        filePath,
        properties,
        text: node.getText(sourceFile),
      });
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
  return results;
}

// Find all interfaces across the codebase
function findAllInterfaces(): TypeInfo[] {
  const interfaces: TypeInfo[] = [];

  function processDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.name.endsWith(".ts")) {
        const interfacesInFile = extractInterfaceInfo(fullPath);
        interfaces.push(...interfacesInFile);
      }
    }
  }

  processDirectory(MLB_TYPES_DIR);
  return interfaces;
}

// Calculate similarity between two interfaces (0-1)
function calculateSimilarity(
  interface1: TypeInfo,
  interface2: TypeInfo
): number {
  const props1 = interface1.properties;
  const props2 = interface2.properties;

  // Count shared properties
  let sharedCount = 0;
  for (const [propName] of props1) {
    if (props2.has(propName)) {
      sharedCount++;
    }
  }

  // Calculate Jaccard similarity
  const totalUniqueProps = new Set([...props1.keys(), ...props2.keys()]).size;

  return sharedCount / totalUniqueProps;
}

// Find interfaces with similar properties
function findSimilarInterfaces(
  interfaces: TypeInfo[],
  similarityThreshold = 0.7
): { groups: TypeInfo[][]; orphans: TypeInfo[] } {
  const groups: TypeInfo[][] = [];
  const processed = new Set<string>();

  for (let i = 0; i < interfaces.length; i++) {
    const current = interfaces[i];

    // Skip if already processed
    if (processed.has(current.name)) continue;
    processed.add(current.name);

    const similarInterfaces = [current];

    for (let j = 0; j < interfaces.length; j++) {
      if (i === j) continue;

      const other = interfaces[j];
      if (processed.has(other.name)) continue;

      const similarity = calculateSimilarity(current, other);
      if (similarity >= similarityThreshold) {
        similarInterfaces.push(other);
        processed.add(other.name);
      }
    }

    if (similarInterfaces.length > 1) {
      groups.push(similarInterfaces);
    }
  }

  // Find orphans (interfaces not in any group)
  const orphans = interfaces.filter(
    (intf) => !groups.some((group) => group.some((g) => g.name === intf.name))
  );

  return { groups, orphans };
}

// Generate a unified interface from multiple similar interfaces
function generateUnifiedInterface(group: TypeInfo[]): string {
  // Use the first interface name as a base
  const baseName = group[0].name;

  // Collect all properties from all interfaces in the group
  const allProperties = new Map<string, Set<string>>();

  for (const intf of group) {
    for (const [propName, propType] of intf.properties) {
      if (!allProperties.has(propName)) {
        allProperties.set(propName, new Set());
      }
      allProperties.get(propName)!.add(propType);
    }
  }

  // Generate unified interface
  let result = `/**\n`;
  result += ` * Unified interface generated from ${group.length} similar interfaces:\n`;
  for (const intf of group) {
    result += ` * - ${intf.name} (${path.relative(
      process.cwd(),
      intf.filePath
    )})\n`;
  }
  result += ` */\n`;
  result += `export interface Unified${baseName} {\n`;

  // Add properties
  for (const [propName, propTypes] of allProperties) {
    // Count which interfaces have this property
    const count = group.filter((intf) => intf.properties.has(propName)).length;
    const isOptional = count < group.length;

    // Generate union type if multiple types
    const typeUnion = Array.from(propTypes).join(" | ");

    result += `  /** Present in ${count}/${group.length} interfaces */\n`;
    result += `  ${propName}${isOptional ? "?" : ""}: ${typeUnion};\n`;
  }

  result += `}\n`;

  return result;
}

// Generate adapter functions between similar interfaces
function generateAdapters(group: TypeInfo[]): string {
  let result = `/**\n`;
  result += ` * Adapter functions for converting between similar interfaces\n`;
  result += ` */\n\n`;

  // Generate adapters between each interface and the unified one
  const unifiedName = `Unified${group[0].name}`;

  for (const intf of group) {
    // From original to unified
    result += `/**\n`;
    result += ` * Convert from ${intf.name} to ${unifiedName}\n`;
    result += ` */\n`;
    result += `export function ${intf.name}To${unifiedName}(source: ${intf.name}): ${unifiedName} {\n`;
    result += `  return {\n`;

    // Add properties with validation
    for (const [propName] of intf.properties) {
      result += `    ${propName}: source.${propName},\n`;
    }

    result += `  };\n`;
    result += `}\n\n`;

    // From unified to original
    result += `/**\n`;
    result += ` * Convert from ${unifiedName} to ${intf.name}\n`;
    result += ` */\n`;
    result += `export function ${unifiedName}To${intf.name}(source: ${unifiedName}): ${intf.name} {\n`;
    result += `  return {\n`;

    // Add properties with validation
    for (const [propName] of intf.properties) {
      result += `    ${propName}: source.${propName} ?? ${getDefaultValue(
        intf.properties.get(propName) || "any"
      )},\n`;
    }

    result += `  };\n`;
    result += `}\n\n`;
  }

  return result;
}

// Get a safe default value for a type
function getDefaultValue(type: string): string {
  if (type.includes("string")) return '""';
  if (type.includes("number")) return "0";
  if (type.includes("boolean")) return "false";
  if (type.includes("[]")) return "[]";
  if (type.includes("Record<") || type.includes("object") || type === "any")
    return "{}";
  return "undefined";
}

// Generate type guards for interfaces
function generateTypeGuards(interfaces: TypeInfo[]): string {
  let result = `/**\n`;
  result += ` * Type guards for runtime type checking\n`;
  result += ` */\n\n`;

  for (const intf of interfaces) {
    result += `/**\n`;
    result += ` * Type guard for ${intf.name}\n`;
    result += ` */\n`;
    result += `export function is${intf.name}(value: any): value is ${intf.name} {\n`;
    result += `  return (\n`;
    result += `    value !== null &&\n`;
    result += `    typeof value === 'object'`;

    // Check required properties
    const requiredProps = Array.from(intf.properties.entries())
      .filter(([, type]) => !type.includes("?") && !type.includes("undefined"))
      .map(([name]) => name);

    if (requiredProps.length > 0) {
      for (const prop of requiredProps) {
        result += ` &&\n    '${prop}' in value`;
      }
    }

    result += `\n  );\n`;
    result += `}\n\n`;
  }

  return result;
}

// Generate a report on interface similarities
function generateSimilarityReport(interfaces: TypeInfo[]): string {
  let report = `# Interface Similarity Analysis\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;

  // Create a similarity matrix
  report += `## Similarity Matrix\n\n`;
  report += `| Interface | Similar To | Similarity | Shared Props | Total Props |\n`;
  report += `|-----------|------------|------------|--------------|-------------|\n`;

  for (let i = 0; i < interfaces.length; i++) {
    const current = interfaces[i];

    for (let j = i + 1; j < interfaces.length; j++) {
      const other = interfaces[j];
      const similarity = calculateSimilarity(current, other);

      // Only show pairs with meaningful similarity
      if (similarity >= 0.3) {
        // Count shared properties
        let sharedCount = 0;
        for (const [propName] of current.properties) {
          if (other.properties.has(propName)) {
            sharedCount++;
          }
        }

        const totalProps = new Set([
          ...current.properties.keys(),
          ...other.properties.keys(),
        ]).size;

        report += `| ${current.name} | ${other.name} | ${(
          similarity * 100
        ).toFixed(1)}% | ${sharedCount} | ${totalProps} |\n`;
      }
    }
  }

  return report;
}

// Main function
async function main() {
  console.log("Finding all interfaces...");
  const interfaces = findAllInterfaces();
  console.log(`Found ${interfaces.length} interfaces`);

  // Find similar interfaces
  console.log("Analyzing interface similarities...");
  const { groups, orphans } = findSimilarInterfaces(interfaces);
  console.log(
    `Found ${groups.length} groups of similar interfaces (${orphans.length} orphans)`
  );

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate unified interfaces
  console.log("Generating unified interfaces...");
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const unifiedInterface = generateUnifiedInterface(group);
    const adapters = generateAdapters(group);

    // Save unified interface
    const outputPath = path.join(
      OUTPUT_DIR,
      `unified-${group[0].name.toLowerCase()}.ts`
    );
    fs.writeFileSync(outputPath, unifiedInterface + "\n\n" + adapters, "utf-8");
    console.log(
      `Generated unified interface for ${group[0].name} (${group.length} members)`
    );
  }

  // Generate type guards
  console.log("Generating type guards...");
  const typeGuards = generateTypeGuards(interfaces);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "type-guards.ts"),
    typeGuards,
    "utf-8"
  );

  // Generate similarity report
  console.log("Generating similarity report...");
  const report = generateSimilarityReport(interfaces);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "similarity-report.md"),
    report,
    "utf-8"
  );

  console.log("Type transformation complete");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
