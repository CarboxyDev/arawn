'use client';

import { useTheme } from 'next-themes';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-28 w-auto' }: LogoProps) {
  const { resolvedTheme } = useTheme();

  const logoSrc =
    resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoSrc} alt="Blitzpack Logo" className={className} />
  );
}
