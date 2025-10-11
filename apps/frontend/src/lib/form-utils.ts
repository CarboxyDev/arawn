import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/**
 * Create a type-safe form resolver from a Zod schema
 * Usage: const form = useForm({ resolver: createFormResolver(MySchema) })
 */
export function createFormResolver<T extends z.ZodType<any, any, any>>(
  schema: T
) {
  return zodResolver(schema);
}
