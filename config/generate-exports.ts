import { readdirSync } from 'fs';

/**
 * Generates tsup entry points and package.json exports automatically
 * by scanning the src directory for .ts files (excluding index.ts and __tests__)
 */
export function generateEntries(srcDir: string): Record<string, string> {
  const files = readdirSync(srcDir).filter(
    (file) =>
      file.endsWith('.ts') &&
      file !== 'index.ts' &&
      !file.startsWith('.') &&
      !file.includes('__tests__')
  );

  return files.reduce(
    (acc, file) => {
      const name = file.replace('.ts', '');
      acc[name] = `src/${file}`;
      return acc;
    },
    { index: 'src/index.ts' } as Record<string, string>
  );
}

/**
 * Generates package.json exports field automatically
 * Maintains proper export precedence: types first, then import, then require
 */
export function generateExports(
  entries: Record<string, string>
): Record<string, Record<string, string>> {
  return Object.keys(entries).reduce(
    (acc, name) => {
      const exportPath = name === 'index' ? '.' : `./${name}`;
      const distName = name === 'index' ? 'index' : name;

      acc[exportPath] = {
        types: `./dist/${distName}.d.ts`,
        import: `./dist/${distName}.mjs`,
        require: `./dist/${distName}.js`,
      };

      return acc;
    },
    {} as Record<string, Record<string, string>>
  );
}

/**
 * Usage in tsup config:
 * import { generateEntries } from '../config/generate-exports';
 *
 * export default createSharedPackageConfig({
 *   entry: generateEntries(join(__dirname, '../packages/types/src'))
 * });
 */
