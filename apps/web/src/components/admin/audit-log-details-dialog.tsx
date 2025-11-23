'use client';

import type { AuditLog } from '@repo/packages-types/audit-log';
import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  FileText,
  Globe,
  Info,
  Monitor,
  ShieldAlert,
  User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditLogDetailsDialogProps {
  log:
    | (AuditLog & { user?: { email: string; name?: string; role?: string } })
    | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getActionBadgeClasses(action: string): string {
  switch (action) {
    case 'user.created':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'user.updated':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'user.deleted':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    case 'user.role_changed':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    case 'session.revoked':
    case 'session.revoked_all':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    case 'password.changed':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case 'account.linked':
      return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20';
    case 'account.unlinked':
      return 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20';
    case 'email.verified':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    case 'email.verification_sent':
      return 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  }
}

function formatAction(action: string) {
  return action
    .split('.')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function AuditLogDetailsDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailsDialogProps) {
  if (!log) return null;

  const affectedUser = log.changes?.before as
    | { email?: string; name?: string; role?: string }
    | null
    | undefined;

  const { before, after } = (log.changes || {}) as {
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Log Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this audit log entry
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)]">
          <div className="space-y-6 pr-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                Action
              </div>
              <Badge
                variant="outline"
                className={`${getActionBadgeClasses(log.action)} text-sm font-medium`}
              >
                {formatAction(log.action)}
              </Badge>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  Performed By
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {log.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-muted-foreground break-all text-xs">
                        {log.user?.email || log.userId}
                      </div>
                      {log.user?.role && (
                        <Badge variant="secondary" className="mt-1.5 text-xs">
                          {log.user.role.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {affectedUser && (
                <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4" />
                    Affected User
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">
                          {affectedUser.name || 'Unknown'}
                        </div>
                        <div className="text-muted-foreground break-all text-xs">
                          {affectedUser.email || 'N/A'}
                        </div>
                        {affectedUser.role && (
                          <Badge variant="secondary" className="mt-1.5 text-xs">
                            {affectedUser.role.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted/50 space-y-4 rounded-lg p-4">
              <div className="text-sm font-semibold">Resource Information</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <FileText className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-muted-foreground text-xs">Type</div>
                    <div className="text-sm font-medium capitalize">
                      {log.resourceType}
                    </div>
                  </div>
                </div>
                {log.resourceId && (
                  <div className="flex items-start gap-3">
                    <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-muted-foreground text-xs">
                        Resource ID
                      </div>
                      <code className="text-muted-foreground block break-all font-mono text-xs">
                        {log.resourceId}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 space-y-4 rounded-lg p-4">
              <div className="text-sm font-semibold">Context</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Globe className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-muted-foreground text-xs">
                      IP Address
                    </div>
                    <code className="font-mono text-sm">
                      {log.ipAddress || 'N/A'}
                    </code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-muted-foreground text-xs">
                      Timestamp
                    </div>
                    <div className="text-sm">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                </div>
              </div>
              {log.userAgent && (
                <div className="flex items-start gap-3 border-t pt-2">
                  <Monitor className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-muted-foreground mb-1 text-xs">
                      User Agent
                    </div>
                    <code className="text-muted-foreground block break-all font-mono text-xs leading-relaxed">
                      {log.userAgent}
                    </code>
                  </div>
                </div>
              )}
            </div>

            {(before || after) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  Changes
                </div>

                {before && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Before
                      </span>
                    </div>
                    <pre className="overflow-x-auto rounded-lg border border-red-500/20 bg-red-500/5 p-4 font-mono text-xs leading-relaxed">
                      {JSON.stringify(before, null, 2)}
                    </pre>
                  </div>
                )}

                {after && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        After
                      </span>
                    </div>
                    <pre className="overflow-x-auto rounded-lg border border-green-500/20 bg-green-500/5 p-4 font-mono text-xs leading-relaxed">
                      {JSON.stringify(after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
