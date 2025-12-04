'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-28 w-auto' }: LogoProps) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const clipId = `logo-clip-${id}`;
  const gradientId = `shine-gradient-${id}`;

  return (
    <svg
      width="358"
      height="490"
      viewBox="0 0 358 490"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-foreground', className)}
      aria-label="Blitzpack Logo"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M190.013 73.7863H21.8626V388.061H108.356L102.468 409.924H0V51.9237H206.646L190.013 73.7863Z" />
          <path d="M358 409.924H162.611L179.105 388.061H336.137V73.7863H254.317L260.311 51.9237H358V409.924Z" />
          <path d="M57.3893 268.5L261.668 0L201.546 219.309H294.462L90.8664 489.176L150.305 268.5H57.3893Z" />
        </clipPath>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="40%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.35" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M190.013 73.7863H21.8626V388.061H108.356L102.468 409.924H0V51.9237H206.646L190.013 73.7863Z"
        fill="currentColor"
      />
      <path
        d="M358 409.924H162.611L179.105 388.061H336.137V73.7863H254.317L260.311 51.9237H358V409.924Z"
        fill="currentColor"
      />
      <path
        d="M57.3893 268.5L261.668 0L201.546 219.309H294.462L90.8664 489.176L150.305 268.5H57.3893Z"
        className="fill-primary"
      />

      <g clipPath={`url(#${clipId})`}>
        <rect
          x="-400"
          y="0"
          width="400"
          height="490"
          fill={`url(#${gradientId})`}
          className="animate-shine-sweep"
        />
      </g>
    </svg>
  );
}
