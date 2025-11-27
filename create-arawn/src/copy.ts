import fs from 'fs-extra';
import { join, relative } from 'path';

const { copy, ensureDir, readJSON } = fs;

interface TemplateConfig {
  replaceable: string[];
  excludeFromTemplate: string[];
}

export async function copyTemplate(
  sourceDir: string,
  destDir: string,
  templateConfig: TemplateConfig
): Promise<void> {
  // Ensure destination directory exists
  await ensureDir(destDir);

  // Convert exclude patterns to regex
  const excludePatterns = templateConfig.excludeFromTemplate.map((pattern) => {
    // Convert glob patterns to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    return new RegExp(`(^|/)${regexPattern}($|/)`);
  });

  // Function to check if path should be excluded
  const shouldExclude = (filePath: string): boolean => {
    const relativePath = relative(sourceDir, filePath);
    return excludePatterns.some((pattern) => pattern.test(relativePath));
  };

  // Copy with filter
  await copy(sourceDir, destDir, {
    filter: (src) => !shouldExclude(src),
  });
}

export async function getTemplateConfig(
  templatePath: string
): Promise<TemplateConfig> {
  try {
    const configPath = join(templatePath, '.template.json');
    const config = await readJSON(configPath);
    return config;
  } catch (error) {
    const configPath = join(templatePath, '.template.json');
    throw new Error(
      `Failed to read .template.json\nLooking for: ${configPath}\nError: ${(error as Error).message}`
    );
  }
}
