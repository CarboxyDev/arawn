import fs from 'fs-extra';
import { downloadTemplate } from 'giget';
import type { Ora } from 'ora';
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
  targetDir: string,
  spinner: Ora
): Promise<void> {
  spinner.text = 'Fetching template from GitHub...';
  await downloadTemplate(GITHUB_REPO, {
    dir: targetDir,
    force: true,
  });

  spinner.text = 'Extracting files...';
  // Small delay to show this step
  await new Promise((resolve) => setTimeout(resolve, 100));

  spinner.text = 'Cleaning up template files...';
  await cleanupExcludes(targetDir);

  // Count files for user feedback
  const files = await countFiles(targetDir);
  spinner.succeed(`Downloaded template (${files} files)`);
}

async function countFiles(dir: string): Promise<number> {
  try {
    let count = 0;
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        count += await countFiles(fullPath);
      } else {
        count++;
      }
    }

    return count;
  } catch {
    return 0;
  }
}
