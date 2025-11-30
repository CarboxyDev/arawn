import fs from 'fs-extra';
import path from 'path';

import { TEMPLATE_EXCLUDES } from './constants.js';

function shouldExclude(relativePath: string): boolean {
  const normalizedPath = relativePath.replace(/\\/g, '/');

  for (const pattern of TEMPLATE_EXCLUDES) {
    if (pattern.startsWith('*')) {
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
  return false;
}

async function copyDir(
  src: string,
  dest: string,
  baseDir: string
): Promise<void> {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relativePath = path.relative(baseDir, srcPath);

    if (shouldExclude(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, baseDir);
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}

export async function copyTemplate(
  templateDir: string,
  targetDir: string
): Promise<void> {
  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      throw new Error(`Directory ${targetDir} is not empty`);
    }
  }

  await copyDir(templateDir, targetDir, templateDir);
}
