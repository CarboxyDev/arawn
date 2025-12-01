import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-28 w-auto' }: LogoProps) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-light.svg"
        alt="Blitzpack Logo"
        className={cn(className, 'dark:hidden')}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dark.svg"
        alt="Blitzpack Logo"
        className={cn(className, 'hidden dark:block')}
      />
    </>
  );
}
