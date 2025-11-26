import { User } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
}

export function UserAvatar({
  src,
  alt = 'User avatar',
  fallback,
  className,
}: UserAvatarProps) {
  return (
    <Avatar className={cn('h-16 w-16', className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
        {fallback || <User className="h-8 w-8" />}
      </AvatarFallback>
    </Avatar>
  );
}
