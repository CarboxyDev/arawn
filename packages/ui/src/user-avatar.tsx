import { User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from './lib/utils';

const colorClasses = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-fuchsia-500',
] as const;

const sizeVariants = {
  sm: {
    avatar: 'h-8 w-8',
    icon: 'h-4 w-4',
    text: 'text-xs',
  },
  md: {
    avatar: 'h-12 w-12',
    icon: 'h-6 w-6',
    text: 'text-sm',
  },
  lg: {
    avatar: 'h-16 w-16',
    icon: 'h-8 w-8',
    text: 'text-base',
  },
  xl: {
    avatar: 'h-20 w-20',
    icon: 'h-10 w-10',
    text: 'text-lg',
  },
} as const;

function generateColorFromString(str: string): string {
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorClasses[hash % colorClasses.length];
}

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email.charAt(0).toUpperCase();
}

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string;
  fallback?: string;
  size?: keyof typeof sizeVariants;
  className?: string;
}

export function UserAvatar({
  src,
  name,
  email,
  fallback,
  size = 'lg',
  className,
}: UserAvatarProps) {
  const displayName = name || email || 'User';
  const initials = fallback || (email ? getInitials(name, email) : undefined);
  const colorClass = email ? generateColorFromString(email) : 'bg-primary';
  const sizeClasses = sizeVariants[size];

  return (
    <Avatar className={cn(sizeClasses.avatar, className)}>
      <AvatarImage src={src ?? undefined} alt={displayName} />
      <AvatarFallback
        className={cn(
          colorClass,
          'text-lg font-semibold text-white',
          sizeClasses.text
        )}
      >
        {initials || <User className={sizeClasses.icon} />}
      </AvatarFallback>
    </Avatar>
  );
}
