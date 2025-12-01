'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
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
  const [displayedTheme, setDisplayedTheme] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && resolvedTheme && !displayedTheme) {
      setDisplayedTheme(resolvedTheme);
    }
  }, [mounted, resolvedTheme, displayedTheme]);

  const toggleTheme = useCallback(async () => {
    if (!mounted) return;

    const isDark = resolvedTheme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    if (!document.startViewTransition) {
      setTheme(newTheme);
      setDisplayedTheme(newTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    await transition.ready;

    const animation = document.documentElement.animate(
      {
        clipPath: isDark
          ? ['inset(100% 0 0 0)', 'inset(0 0 0 0)']
          : ['inset(0 0 100% 0)', 'inset(0 0 0 0)'],
      },
      {
        duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );

    animation.onfinish = () => {
      setDisplayedTheme(newTheme);
    };
  }, [resolvedTheme, setTheme, mounted, duration]);

  const showDarkIcon = displayedTheme === 'dark';

  if (!mounted) {
    return (
      <button
        className={cn(
          'relative cursor-pointer',
          'bg-secondary hover:bg-secondary/80',
          'border-border border',
          'rounded-md p-2',
          'transition-colors duration-200',
          'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
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

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'group relative cursor-pointer',
        'bg-secondary hover:bg-secondary/80',
        'border-border border',
        'rounded-md p-2',
        'transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          className={cn(
            'absolute h-5 w-5 transition-all duration-200',
            showDarkIcon
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
        />
        <Moon
          className={cn(
            'absolute h-5 w-5 transition-all duration-200',
            showDarkIcon
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
