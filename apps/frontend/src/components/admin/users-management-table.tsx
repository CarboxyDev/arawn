'use client';

import type { Role, User } from '@repo/packages-types';
import { RoleSchema } from '@repo/packages-types';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Filter, MoreHorizontal, UserCheck } from 'lucide-react';
import * as React from 'react';

import { UserCreateDialog } from '@/components/admin/user-create-dialog';
import { UserDeleteDialog } from '@/components/admin/user-delete-dialog';
import { UserEditDialog } from '@/components/admin/user-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFetchUsers } from '@/hooks/api/use-users';

const getRoleBadgeVariant = (role: Role) => {
  switch (role) {
    case 'super_admin':
      return 'default';
    case 'admin':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getRoleDisplay = (role: Role) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    default:
      return 'User';
  }
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
          <UserCheck className="text-primary h-4 w-4" />
        </div>
        <div className="font-medium">{row.getValue('name')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground font-mono text-sm">
        {row.getValue('email')}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as Role;
      return (
        <Badge variant={getRoleBadgeVariant(role)}>
          {getRoleDisplay(role)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string | Date;
      return (
        <div className="text-muted-foreground text-sm">
          {format(new Date(date), 'MMM dd, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center justify-end gap-2">
          <UserEditDialog user={user} />
          <UserDeleteDialog user={user} />
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
                onClick={() => {
                  navigator.clipboard.writeText(user.id);
                }}
              >
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(user.email);
                }}
              >
                Copy Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function UsersManagementTable() {
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

  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);

  const searchFilter = columnFilters.find((filter) => filter.id === 'name');
  const searchValue = searchFilter?.value as string | undefined;

  const queryParams: {
    page: number;
    limit: number;
    sortBy: 'name' | 'email' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    search?: string;
  } = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: (sorting[0]?.id as 'name' | 'email' | 'createdAt') || 'createdAt',
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
  };

  if (searchValue) {
    queryParams.search = searchValue;
  }

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useFetchUsers(queryParams);

  if (isError) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm">
          Error loading users: {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  const allUsers = response?.data || [];
  const filteredUsers =
    selectedRoles.length > 0
      ? allUsers.filter((user) => selectedRoles.includes(user.role))
      : allUsers;

  const total = response?.pagination?.total || 0;

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter by Role
                {selectedRoles.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedRoles.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {RoleSchema.options.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                >
                  {getRoleDisplay(role)}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedRoles.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedRoles([])}>
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedRoles.length > 0 && (
            <div className="text-muted-foreground text-sm">
              Showing {filteredUsers.length} of {allUsers.length} users
            </div>
          )}
        </div>

        <UserCreateDialog />
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        rowCount={total}
        isLoading={isLoading}
        searchPlaceholder="Search by name or email..."
        searchColumnId="name"
      />
    </div>
  );
}
