import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clamp,
  formatBytes,
  formatDate,
  formatDateTime,
  getRelativeTime,
  groupBy,
  retry,
  sleep,
  slugify,
  truncate,
  unique,
} from '../index';

describe('slugify', () => {
  it('should convert text to slug format', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('TypeScript is Great!')).toBe('typescript-is-great');
  });

  it('should handle special characters', () => {
    expect(slugify('React & Vue.js')).toBe('react-vuejs');
    expect(slugify('C++ Programming')).toBe('c-programming');
  });

  it('should handle multiple spaces and trim', () => {
    expect(slugify('  too   many    spaces  ')).toBe('too-many-spaces');
  });

  it('should handle underscores', () => {
    expect(slugify('snake_case_text')).toBe('snake-case-text');
  });
});

describe('truncate', () => {
  it('should truncate text longer than maxLength', () => {
    expect(truncate('This is a long text', 10)).toBe('This is...');
  });

  it('should not truncate text shorter than maxLength', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });

  it('should return text as-is when exactly maxLength', () => {
    expect(truncate('Exactly10!', 10)).toBe('Exactly10!');
  });
});

describe('formatDate', () => {
  it('should format Date object to YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('should format ISO string to YYYY-MM-DD', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('2024-01-15');
  });
});

describe('formatDateTime', () => {
  it('should format Date object to localized string', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDateTime(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should format ISO string to localized string', () => {
    const formatted = formatDateTime('2024-01-15T10:30:00Z');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });
});

describe('getRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should return "just now" for recent dates', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const recentDate = new Date(now.getTime() - 30000);
    expect(getRelativeTime(recentDate)).toBe('just now');
  });

  it('should return minutes ago', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const pastDate = new Date(now.getTime() - 5 * 60 * 1000);
    expect(getRelativeTime(pastDate)).toBe('5 minutes ago');
  });

  it('should return hours ago', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const pastDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(getRelativeTime(pastDate)).toBe('3 hours ago');
  });

  it('should return days ago', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(getRelativeTime(pastDate)).toBe('2 days ago');
  });

  it('should return formatted date for old dates', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const oldDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const result = getRelativeTime(oldDate);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe('sleep', () => {
  it('should resolve after specified milliseconds', async () => {
    vi.useFakeTimers();
    const promise = sleep(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe('retry', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retry(fn, 3, 100);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await retry(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max attempts', async () => {
    const error = new Error('always fails');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(retry(fn, 3, 10)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('formatBytes', () => {
  it('should format zero bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(5242880)).toBe('5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  it('should respect decimals parameter', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB');
    expect(formatBytes(1536, 3)).toBe('1.5 KB');
  });
});

describe('clamp', () => {
  it('should clamp value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should clamp to minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should clamp to maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-15, -10, -5)).toBe(-10);
    expect(clamp(-3, -10, -5)).toBe(-5);
  });
});

describe('unique', () => {
  it('should remove duplicates from array', () => {
    expect(unique([1, 2, 2, 3, 3, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('should work with strings', () => {
    expect(unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('should return empty array for empty input', () => {
    expect(unique([])).toEqual([]);
  });

  it('should preserve single item arrays', () => {
    expect(unique([1])).toEqual([1]);
  });
});

describe('groupBy', () => {
  it('should group objects by key function', () => {
    const items = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 25 },
    ];

    const grouped = groupBy(items, (item) => item.age);
    expect(grouped[25]).toHaveLength(2);
    expect(grouped[30]).toHaveLength(1);
    expect(grouped[25][0].name).toBe('Alice');
    expect(grouped[25][1].name).toBe('Charlie');
  });

  it('should work with string keys', () => {
    const items = [
      { type: 'fruit', name: 'apple' },
      { type: 'vegetable', name: 'carrot' },
      { type: 'fruit', name: 'banana' },
    ];

    const grouped = groupBy(items, (item) => item.type);
    expect(grouped.fruit).toHaveLength(2);
    expect(grouped.vegetable).toHaveLength(1);
  });

  it('should handle empty array', () => {
    const grouped = groupBy([], (item: { id: number }) => item.id);
    expect(grouped).toEqual({});
  });
});
