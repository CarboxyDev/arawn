import { faker } from '@faker-js/faker';

/**
 * Configure faker with a seed for deterministic data generation
 * Useful for consistent test data or reproducible demos
 *
 * @example
 * ```typescript
 * import { configureFaker } from '@repo/shared-utils';
 *
 * // Use a seed for reproducible data
 * configureFaker(12345);
 *
 * // Or use current timestamp for random data
 * configureFaker();
 * ```
 */
export function configureFaker(seed?: number): void {
  faker.seed(seed ?? Date.now());
}

/**
 * Reset faker to use random seed (undo configureFaker)
 */
export function resetFaker(): void {
  faker.seed();
}

export { faker };
