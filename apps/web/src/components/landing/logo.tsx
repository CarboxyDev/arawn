'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-16 w-auto' }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fillPrimary =
    mounted && resolvedTheme === 'dark' ? '#FFFFFF' : '#252525';
  const fillSecondary =
    mounted && resolvedTheme === 'dark' ? '#A3A3A3' : '#5A5A5A';

  return (
    <svg
      className={className}
      viewBox="0 0 348 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Arawn Logo"
    >
      <path
        d="M132.096 224.64V216.576C143.872 216.576 151.296 215.04 154.368 211.968L132.864 153.216H59.136L39.168 209.664C41.728 214.272 49.664 216.576 62.976 216.576V224.64H0V216.576C14.08 216.576 22.144 213.888 24.192 208.512L98.688 0H129.792L205.056 208.512C206.848 213.888 215.04 216.576 229.632 216.576V224.64H132.096ZM95.616 51.072L63.744 140.544H128.256L95.616 51.072Z"
        fill={fillPrimary}
      />
      <path
        d="M187.81 80.64H219.76V208.59H235.81C240.26 208.59 244.035 207.015 247.135 203.865C250.285 200.715 251.86 196.99 251.86 192.69V80.64H283.81V208.59H299.86C304.21 208.59 307.935 207.015 311.035 203.865C314.185 200.715 315.76 196.99 315.76 192.69V80.64H347.86V169.965C347.86 184.865 342.485 197.715 331.735 208.515C321.035 219.265 308.185 224.64 293.185 224.64H251.86V219.54C245.71 222.94 238.135 224.64 229.135 224.64H187.81V80.64Z"
        fill={fillSecondary}
      />
    </svg>
  );
}
