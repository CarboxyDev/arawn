#!/usr/bin/env node
/**
 * Updates package.json exports field automatically based on src directory contents
 * Run this before building: pnpm --filter @repo/packages-types run update-exports
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { generateEntries, generateExports } from './generate-exports';

function updatePackageExports(packageDir: string) {
  const srcDir = join(packageDir, 'src');
  const packageJsonPath = join(packageDir, 'package.json');

  // Generate entries and exports
  const entries = generateEntries(srcDir);
  const exports = generateExports(entries);

  // Read current package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // Update exports
  packageJson.exports = exports;

  // Write back
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`✅ Updated exports in ${packageJsonPath}`);
  console.log(`   Entry points: ${Object.keys(entries).join(', ')}`);
}

// Get package directory from argv or use current directory
const packageDir = process.argv[2] || process.cwd();
updatePackageExports(packageDir);
