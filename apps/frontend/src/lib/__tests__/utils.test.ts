import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500');
  });

  it('should handle conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
      'base active'
    );
  });

  it('should handle undefined and null', () => {
    expect(cn('base', undefined, null)).toBe('base');
  });

  it('should handle arrays', () => {
    expect(cn(['px-2', 'py-1'])).toBe('px-2 py-1');
  });
});
