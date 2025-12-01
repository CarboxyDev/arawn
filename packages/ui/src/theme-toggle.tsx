'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { cn } from './lib/utils';

interface ThemeToggleProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number;
}

export const ThemeToggle = ({
  className,
  duration = 500,
  ...props
}: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current || !mounted) return;

    const isDark = resolvedTheme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    await transition.ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  }, [resolvedTheme, setTheme, mounted, duration]);

  if (!mounted) {
    return (
      <button
        className={cn(
          'relative cursor-pointer',
          'bg-secondary hover:bg-secondary/80',
          'border-border border',
          'rounded-md p-2',
          'transition-colors duration-200',
          className
        )}
        disabled
        {...props}
      >
        <div className="flex h-5 w-5 items-center justify-center" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'group relative cursor-pointer',
        'bg-secondary hover:bg-secondary/80',
        'border-border border',
        'rounded-md p-2',
        'transition-all duration-200',
        'hover:scale-105 active:scale-95',
        className
      )}
      {...props}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          className={cn(
            'absolute h-5 w-5 transition-all duration-300',
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
        />
        <Moon
          className={cn(
            'absolute h-5 w-5 transition-all duration-300',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
