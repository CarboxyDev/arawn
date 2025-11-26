'use client';

import type { RecentSignup, TopActivityUser } from '@repo/packages-types/stats';
import { ScrollArea } from '@repo/packages-ui/scroll-area';
import { Skeleton } from '@repo/packages-ui/skeleton';
import { UserAvatar } from '@repo/packages-ui/user-avatar';
import { motion } from 'framer-motion';

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function getInitials(name: string | null, email: string) {
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

interface RecentSignupsFeedProps {
  signups: RecentSignup[];
}

export function RecentSignupsFeed({ signups }: RecentSignupsFeedProps) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Recent Signups</h3>
        <p className="text-muted-foreground text-xs">
          Latest user registrations
        </p>
      </div>
      <ScrollArea className="h-[280px] pr-3">
        <div className="space-y-3">
          {signups.map((signup, index) => (
            <motion.div
              key={signup.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <UserAvatar
                src={signup.image}
                fallback={getInitials(signup.name, signup.email)}
                className="size-8"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {signup.name || 'No name'}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {signup.email}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatRelativeTime(signup.createdAt)}
              </span>
            </motion.div>
          ))}
          {signups.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No recent signups
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface TopActivityUsersFeedProps {
  users: TopActivityUser[];
}

export function TopActivityUsersFeed({ users }: TopActivityUsersFeedProps) {
  const maxCount = Math.max(...users.map((u) => u.actionCount), 1);

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Most Active Users</h3>
        <p className="text-muted-foreground text-xs">
          By actions in last 30 days
        </p>
      </div>
      <ScrollArea className="h-[280px] pr-3">
        <div className="space-y-3">
          {users.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-5 text-xs font-medium">
                  #{index + 1}
                </span>
                <UserAvatar
                  src={user.image}
                  fallback={getInitials(user.name, user.email)}
                  className="size-7"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user.name || user.email}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  {user.actionCount} actions
                </span>
              </div>
              <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.actionCount / maxCount) * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
          {users.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No activity data
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 space-y-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
