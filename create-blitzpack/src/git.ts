import { execSync } from 'child_process';

export function isGitInstalled(): boolean {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function initGit(targetDir: string): boolean {
  try {
    execSync('git init', { cwd: targetDir, stdio: 'ignore' });
    execSync('git add -A', { cwd: targetDir, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from create-blitzpack"', {
      cwd: targetDir,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}
