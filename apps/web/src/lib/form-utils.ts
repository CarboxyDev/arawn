import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Create a type-safe form resolver from a Zod schema
 * Usage: const form = useForm({ resolver: createFormResolver(MySchema) })
 */
export function createFormResolver<T extends Parameters<typeof zodResolver>[0]>(
  schema: T
) {
  return zodResolver(schema);
}
