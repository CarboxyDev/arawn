/**
 * Shared build configuration for all packages in the monorepo.
 * Ensures consistent build behavior across @repo/packages-*.
 */
export function createSharedPackageConfig(options?: {
  entry?: Record<string, string>;
}) {
  const entry = options?.entry || { index: 'src/index.ts' };

  return {
    entry,
    format: ['cjs', 'esm'] as const,
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
  };
}
