'use client';

import type {
  AuditAction,
  AuditLog,
  AuditResourceType,
} from '@repo/packages-types';
import { format } from 'date-fns';
import { Calendar, Eye, Search, User, UserX } from 'lucide-react';
import { useState } from 'react';

import { AuditLogDetailsDialog } from '@/components/admin/audit-log-details-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFetchAuditLogs } from '@/hooks/api/use-audit-logs';

function getActionBadgeClasses(action: string): string {
  switch (action) {
    case 'user.created':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'user.updated':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'user.deleted':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'user.role_changed':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    case 'session.revoked':
    case 'session.revoked_all':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    case 'password.changed':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'account.linked':
      return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';
    case 'account.unlinked':
      return 'bg-pink-500/10 text-pink-700 dark:text-pink-400';
    case 'email.verified':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    case 'email.verification_sent':
      return 'bg-teal-500/10 text-teal-700 dark:text-teal-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
}

function AuditLogsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<
    AuditResourceType | 'all'
  >('all');
  const [selectedLog, setSelectedLog] = useState<
    | (AuditLog & { user?: { email: string; name?: string; role?: string } })
    | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useFetchAuditLogs({
    page,
    limit: 20,
    ...(search && { search }),
    ...(actionFilter !== 'all' && { action: actionFilter }),
    ...(resourceTypeFilter !== 'all' && { resourceType: resourceTypeFilter }),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const formatAction = (action: string) => {
    return action
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all user actions and system events
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by user ID or IP address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={actionFilter}
          onValueChange={(value) => {
            setActionFilter((value || 'all') as AuditAction | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="user.created">User Created</SelectItem>
            <SelectItem value="user.updated">User Updated</SelectItem>
            <SelectItem value="user.deleted">User Deleted</SelectItem>
            <SelectItem value="user.role_changed">Role Changed</SelectItem>
            <SelectItem value="session.revoked">Session Revoked</SelectItem>
            <SelectItem value="session.revoked_all">
              All Sessions Revoked
            </SelectItem>
            <SelectItem value="password.changed">Password Changed</SelectItem>
            <SelectItem value="account.linked">Account Linked</SelectItem>
            <SelectItem value="account.unlinked">Account Unlinked</SelectItem>
            <SelectItem value="email.verified">Email Verified</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={resourceTypeFilter}
          onValueChange={(value) => {
            setResourceTypeFilter(
              (value || 'all') as AuditResourceType | 'all'
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="session">Session</SelectItem>
            <SelectItem value="account">Account</SelectItem>
            <SelectItem value="password">Password</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-muted/50 rounded-lg border py-12 text-center">
          <Calendar className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
          <h3 className="mb-1 font-semibold">No audit logs found</h3>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Affected User</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(
                  (
                    log: AuditLog & {
                      user?: { email: string; name?: string; role?: string };
                    }
                  ) => {
                    const affectedUser = log.changes?.before as
                      | { email?: string; name?: string; role?: string }
                      | null
                      | undefined;

                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getActionBadgeClasses(log.action)}
                          >
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground h-4 w-4" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {log.user?.name ||
                                  log.user?.email ||
                                  log.userId}
                              </div>
                              {log.user?.name && log.user?.email && (
                                <div className="text-muted-foreground truncate text-xs">
                                  {log.user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {affectedUser ? (
                            <div className="flex items-center gap-2">
                              <User className="text-muted-foreground h-4 w-4" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">
                                  {affectedUser.name ||
                                    affectedUser.email ||
                                    'Unknown'}
                                </div>
                                {affectedUser.name && affectedUser.email && (
                                  <div className="text-muted-foreground truncate text-xs">
                                    {affectedUser.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <UserX className="text-muted-foreground h-4 w-4" />
                              <span className="text-muted-foreground text-sm">
                                N/A
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium capitalize">
                              {log.resourceType}
                            </div>
                            {log.resourceId && (
                              <div className="text-muted-foreground max-w-[200px] truncate text-xs">
                                {log.resourceId}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {log.ipAddress || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {format(
                              new Date(log.createdAt),
                              'MMM dd, yyyy HH:mm'
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {(page - 1) * pagination.limit + 1} to{' '}
                {Math.min(page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} logs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AuditLogDetailsDialog
        log={selectedLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

export default function AuditLogsPage() {
  return <AuditLogsContent />;
}
