'use client';

import type { User } from '@repo/packages-types';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFetchUsers } from '@/hooks/api/use-users';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
          {role}
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
        <div className="text-muted-foreground">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

  const users = response?.data || [];
  const total = response?.pagination?.total || 0;

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        rowCount={total}
        isLoading={isLoading}
        searchPlaceholder="Search users..."
        searchColumnId="name"
      />
    </div>
  );
}
