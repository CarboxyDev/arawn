import fs from 'fs-extra';
import { downloadTemplate } from 'giget';
import path from 'path';

const GITHUB_REPO = 'github:CarboxyDev/blitzpack';

const POST_DOWNLOAD_EXCLUDES = [
  'create-blitzpack',
  'scripts/setup.js',
  '.github',
  'apps/marketing',
];

async function cleanupExcludes(targetDir: string): Promise<void> {
  for (const exclude of POST_DOWNLOAD_EXCLUDES) {
    const fullPath = path.join(targetDir, exclude);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  }
}

export async function downloadAndPrepareTemplate(
  targetDir: string
): Promise<void> {
  await downloadTemplate(GITHUB_REPO, {
    dir: targetDir,
    force: true,
  });

  await cleanupExcludes(targetDir);
}
