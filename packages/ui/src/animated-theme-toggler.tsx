'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { cn } from './lib/utils';

interface AnimatedThemeTogglerProps {
  className?: string;
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 600,
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / 10;
      const deltaY = (e.clientY - centerY) / 10;

      setMousePosition({ x: deltaX, y: deltaY });
    },
    []
  );

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current || !mounted) return;

    const isDark = theme === 'dark';

    if (!document.startViewTransition) {
      setTheme(isDark ? 'light' : 'dark');
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(isDark ? 'light' : 'dark');
      });
    });

    await transition.ready;

    const clipPath = isDark
      ? ['inset(0 0 100% 0)', 'inset(0 0 0 0)']
      : ['inset(100% 0 0 0)', 'inset(0 0 0 0)'];

    document.documentElement.animate(
      {
        clipPath,
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  }, [theme, setTheme, mounted, duration]);

  if (!mounted) {
    return (
      <button
        className={cn(
          'relative cursor-pointer overflow-visible',
          'bg-secondary hover:bg-secondary/80',
          'border-border border',
          'rounded-md p-2',
          'transition-colors duration-200',
          className
        )}
        disabled
      >
        <div className="flex h-5 w-5 items-center justify-center" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={toggleTheme}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      className={cn(
        'relative cursor-pointer overflow-visible',
        'bg-secondary hover:bg-secondary/80',
        'border-border border',
        'rounded-md p-2',
        'transition-colors duration-200',
        className
      )}
      animate={{
        x: isHovered ? mousePosition.x : 0,
        y: isHovered ? mousePosition.y : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ rotateY: -180, scale: 0 }}
            animate={{ rotateY: 0, scale: 1 }}
            exit={{ rotateY: 180, scale: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotateY: -180, scale: 0 }}
            animate={{ rotateY: 0, scale: 1 }}
            exit={{ rotateY: 180, scale: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
};
