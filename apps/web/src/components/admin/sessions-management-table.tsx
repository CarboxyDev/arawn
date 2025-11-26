'use client';

import type { AdminSession, QuerySessions } from '@repo/packages-types/session';
import { Badge } from '@repo/packages-ui/badge';
import { Button } from '@repo/packages-ui/button';
import { DataTable } from '@repo/packages-ui/data-table/data-table';
import { DataTableColumnHeader } from '@repo/packages-ui/data-table/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/packages-ui/dropdown-menu';
import { UserAvatar } from '@repo/packages-ui/user-avatar';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
  Filter,
  Monitor,
  MoreHorizontal,
  Smartphone,
  Tablet,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { SessionRevokeAllDialog } from '@/components/admin/session-revoke-all-dialog';
import { SessionRevokeDialog } from '@/components/admin/session-revoke-dialog';
import { useFetchAdminSessions } from '@/hooks/api/use-admin-sessions';

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown';

  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';

  return 'Other';
}

type DeviceType = 'Mobile' | 'Tablet' | 'Desktop' | 'Unknown';

function getDeviceType(ua: string | null): DeviceType {
  if (!ua) return 'Unknown';

  if (ua.includes('Mobile') || ua.includes('Android')) return 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
  return 'Desktop';
}

const deviceIcons: Record<DeviceType, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
  Unknown: Monitor,
};

function isSessionActive(expiresAt: Date): boolean {
  return new Date(expiresAt) > new Date();
}

const columns: ColumnDef<AdminSession>[] = [
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    meta: { label: 'User' },
    cell: ({ row }) => {
      const user = row.original.user;
      const initials = user.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : user.email.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <UserAvatar
            src={user.image}
            alt={user.name || user.email}
            fallback={initials}
            className="h-8 w-8"
          />
          <div>
            <div className="font-medium">{user.name || 'No name'}</div>
            <div className="text-muted-foreground font-mono text-xs">
              {user.email}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP Address" />
    ),
    meta: { label: 'IP Address' },
    cell: ({ row }) => (
      <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
        {row.getValue('ipAddress') || 'Unknown'}
      </code>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'userAgent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device" />
    ),
    meta: { label: 'Device' },
    cell: ({ row }) => {
      const ua = row.getValue('userAgent') as string | null;
      const browser = parseUserAgent(ua);
      const device = getDeviceType(ua);
      const DeviceIcon = deviceIcons[device];

      return (
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
            <DeviceIcon className="text-muted-foreground h-4 w-4" />
          </div>
          <div className="text-sm">
            <div className="font-medium">{browser}</div>
            <div className="text-muted-foreground text-xs">{device}</div>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    meta: { label: 'Created' },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string | Date;
      return (
        <div className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'expiresAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    meta: { label: 'Status' },
    cell: ({ row }) => {
      const expiresAt = row.getValue('status') as string | Date;
      const active = isSessionActive(new Date(expiresAt));

      return (
        <Badge variant={active ? 'default' : 'secondary'}>
          {active ? 'Active' : 'Expired'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const session = row.original;
      const active = isSessionActive(new Date(session.expiresAt));

      if (!active) return null;

      return (
        <div className="flex items-center justify-end gap-2">
          <SessionRevokeDialog session={session} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">More options</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => copyToClipboard(session.id, 'Session ID')}
              >
                Copy Session ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(session.user.id, 'User ID')}
              >
                Copy User ID
              </DropdownMenuItem>
              {session.ipAddress && (
                <DropdownMenuItem
                  onClick={() =>
                    copyToClipboard(session.ipAddress!, 'IP Address')
                  }
                >
                  Copy IP Address
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

type StatusFilter = 'active' | 'expired' | 'all';

export function SessionsManagementTable() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>('active');

  const searchFilter = columnFilters.find((filter) => filter.id === 'user');
  const searchValue = searchFilter?.value as string | undefined;

  const queryParams: QuerySessions = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: (sorting[0]?.id as 'createdAt' | 'expiresAt') || 'createdAt',
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    status: statusFilter,
    ...(searchValue && { search: searchValue }),
  };

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useFetchAdminSessions(queryParams);

  const sessions = React.useMemo(() => response?.data || [], [response?.data]);
  const total = response?.pagination?.total || 0;

  const userGroups = React.useMemo(() => {
    const groups = new Map<
      string,
      { user: AdminSession['user']; count: number }
    >();
    sessions.forEach((s) => {
      const existing = groups.get(s.user.id);
      if (existing) {
        existing.count++;
      } else {
        groups.set(s.user.id, { user: s.user, count: 1 });
      }
    });
    return Array.from(groups.values()).filter((g) => g.count > 1);
  }, [sessions]);

  if (isError) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm">
          Error loading sessions: {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Status:{' '}
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <DropdownMenuRadioItem value="active">
                  Active
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expired">
                  Expired
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {userGroups.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Revoke All Sessions For</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userGroups.slice(0, 5).map(({ user, count }) => (
                  <div key={user.id} className="px-2 py-1.5">
                    <SessionRevokeAllDialog
                      userId={user.id}
                      userName={user.name || ''}
                      userEmail={user.email}
                    />
                    <span className="text-muted-foreground ml-2 text-xs">
                      ({count} sessions)
                    </span>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="text-muted-foreground text-sm">
          {total} session{total !== 1 ? 's' : ''}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sessions}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        rowCount={total}
        isLoading={isLoading}
        searchPlaceholder="Search by user email or name..."
        searchColumnId="user"
      />
    </div>
  );
}
