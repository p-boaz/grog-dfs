/**
 * Fix Import Paths Script
 * 
 * This script scans the codebase for incorrect relative imports and fixes them.
 * It focuses on the dfs-analysis directory where most path issues occur.
 */

import * as fs from 'fs';
import * as path from 'path';

// Paths to check
const DFS_ANALYSIS_DIR = path.join(process.cwd(), 'lib', 'mlb', 'dfs-analysis');

// Mapping of directories and their required import prefixes
const PATH_MAPPING: Record<string, string> = {
  'core': '../../core',
  'game': '../../game',
  'player': '../../player',
  'schedule': '../../schedule',
  'services': '../../services',
  'weather': '../../weather',
  'types': '../../types',  // This will be overridden for types in dfs-analysis
  'draftkings': '../../draftkings',
  'index': '../../index'
};

// Find all TypeScript files in a directory (recursive)
function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Check if a path should be fixed
function shouldFixPath(importPath: string, fromSubdir: string): [boolean, string] {
  // Don't fix absolute paths or paths to other packages
  if (importPath.startsWith('/') || !importPath.startsWith('.')) {
    return [false, importPath];
  }
  
  // Don't change imports from the same directory
  if (importPath.startsWith('./')) {
    return [false, importPath];
  }
  
  // Special case: Types within dfs-analysis folder
  if (importPath.includes('types/analysis') && !importPath.startsWith('../../')) {
    // This is a relative path to our dfs-analysis/types folder
    return [false, importPath];
  }
  
  // Handle each directory in our mapping
  for (const [dir, prefix] of Object.entries(PATH_MAPPING)) {
    // Check if this import is for this directory and isn't already correct
    const dirMatch = new RegExp(`["\']\\.\\.\\/${dir}\\/`);
    
    if (dirMatch.test(importPath)) {
      // This is pointing to a core module with just one ../ prefix
      // It should have ../../ prefix
      const fixedPath = importPath.replace(`../`, prefix.startsWith('../') ? prefix : `../../${dir}/`);
      return [true, fixedPath];
    }
  }
  
  return [false, importPath];
}

// Fix imports in a file
function fixImportsInFile(filePath: string): { fixed: boolean; changes: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const subDir = path.relative(DFS_ANALYSIS_DIR, path.dirname(filePath)).split(path.sep)[0] || '';
  
  // Regular expression to find import statements
  const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?["']([^"']+)["']/g;
  
  let match;
  let newContent = content;
  let anyFixed = false;
  const changes: string[] = [];
  
  // Process each import statement
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const [shouldFix, fixedPath] = shouldFixPath(importPath, subDir);
    
    if (shouldFix) {
      newContent = newContent.replace(`'${importPath}'`, `'${fixedPath}'`);
      newContent = newContent.replace(`"${importPath}"`, `"${fixedPath}"`);
      
      anyFixed = true;
      changes.push(`${importPath} -> ${fixedPath}`);
    }
  }
  
  // Only write back if changes were made
  if (anyFixed) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
  
  return { fixed: anyFixed, changes };
}

// Main function
async function fixImportPaths() {
  console.log('Scanning for TypeScript files...');
  const tsFiles = findTsFiles(DFS_ANALYSIS_DIR);
  console.log(`Found ${tsFiles.length} TypeScript files in dfs-analysis directory`);
  
  let fixedFiles = 0;
  const allChanges: Record<string, string[]> = {};
  
  for (const file of tsFiles) {
    const { fixed, changes } = fixImportsInFile(file);
    
    if (fixed) {
      fixedFiles++;
      allChanges[file] = changes;
    }
  }
  
  console.log(`\nFixed imports in ${fixedFiles} files`);
  
  if (fixedFiles > 0) {
    console.log('\nChanges made:');
    for (const [file, changes] of Object.entries(allChanges)) {
      const relPath = path.relative(process.cwd(), file);
      console.log(`\n${relPath}:`);
      for (const change of changes) {
        console.log(`  ${change}`);
      }
    }
  }
}

// Run the script
fixImportPaths().catch(error => {
  console.error('Error fixing import paths:', error);
  process.exit(1);
});