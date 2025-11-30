import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const templateDir = path.resolve(__dirname, '..', 'template');

const EXCLUDES = [
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'coverage',
  '.git',
  'pnpm-lock.yaml',
  'tsconfig.tsbuildinfo',
  '.env.local',
  '.DS_Store',
  '.temp',
  '.claude',
  '.cursor',
  'create-blitzpack',
  'apps/api/src/generated',
  'apps/api/public/uploads',
  'scripts/setup.js',
];

function shouldExclude(relativePath) {
  const normalizedPath = relativePath.replace(/\\/g, '/');

  for (const pattern of EXCLUDES) {
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (normalizedPath.endsWith(ext)) return true;
    } else if (
      normalizedPath === pattern ||
      normalizedPath.startsWith(pattern + '/')
    ) {
      return true;
    } else {
      const parts = normalizedPath.split('/');
      if (parts.includes(pattern)) return true;
    }
  }

  if (normalizedPath.endsWith('.tsbuildinfo')) return true;
  if (normalizedPath.endsWith('.env.local')) return true;

  return false;
}

function copyDir(src, dest, baseDir) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relativePath = path.relative(baseDir, srcPath);

    if (shouldExclude(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, baseDir);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(templateDir)) {
  fs.rmSync(templateDir, { recursive: true });
}

console.log('Copying template files...');
copyDir(rootDir, templateDir, rootDir);
console.log('Template files copied successfully.');
