'use client';

import type { CreateUser, QueryUsers, User } from '@repo/packages-types';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreateUser, useFetchUsers } from '@/hooks/api/use-users';
import { getErrorMessage } from '@/lib/api';

/**
 * Example component demonstrating TanStack Query + API integration patterns
 *
 * Shows:
 * - Fetching data with query parameters
 * - Loading and error states
 * - Creating records with mutations
 * - Error handling with toast notifications
 * - Pagination and filtering
 */
export function UsersListExample() {
  const [queryParams, setQueryParams] = useState<QueryUsers>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useFetchUsers(queryParams);

  const { mutate: createUser, isPending: isCreating } = useCreateUser();

  const handleCreateUser = () => {
    if (!newUserName || !newUserEmail) {
      toast.error('Name and email are required');
      return;
    }

    const userData: CreateUser = {
      name: newUserName,
      email: newUserEmail,
      role: 'user',
    };

    createUser(userData, {
      onSuccess: () => {
        toast.success('User created successfully!');
        setNewUserName('');
        setNewUserEmail('');
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
        <h3 className="text-destructive font-semibold">Error loading users</h3>
        <p className="text-muted-foreground text-sm">
          {getErrorMessage(error)}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const users = usersResponse?.data ?? [];
  const pagination = usersResponse?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
        <p className="text-muted-foreground">
          Example demonstrating API integration with TanStack Query
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Create New User</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            disabled={isCreating}
          />
          <Input
            placeholder="Email"
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            disabled={isCreating}
          />
          <Button
            onClick={handleCreateUser}
            disabled={isCreating || !newUserName || !newUserEmail}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search users..."
          value={queryParams.search ?? ''}
          onChange={(e) =>
            setQueryParams((prev) => ({
              ...prev,
              search: e.target.value || undefined,
              page: 1,
            }))
          }
          className="max-w-sm"
        />
        <select
          value={queryParams.sortBy}
          onChange={(e) =>
            setQueryParams((prev) => ({
              ...prev,
              sortBy: e.target.value as QueryUsers['sortBy'],
            }))
          }
          className="rounded-md border px-3"
        >
          <option value="createdAt">Created Date</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
        </select>
        <select
          value={queryParams.sortOrder}
          onChange={(e) =>
            setQueryParams((prev) => ({
              ...prev,
              sortOrder: e.target.value as QueryUsers['sortOrder'],
            }))
          }
          className="rounded-md border px-3"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center px-4">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
