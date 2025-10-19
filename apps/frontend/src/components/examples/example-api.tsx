'use client';

import type { CreateUser, User } from '@repo/packages-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { api, getErrorMessage } from '@/lib/api';

export function ExampleApi() {
  const queryClient = useQueryClient();

  // GET: Fetch users list
  const {
    data: users,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users'),
  });

  // POST: Create user mutation
  const createUser = useMutation({
    mutationFn: (newUser: CreateUser) => api.post<User>('/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // DELETE: Delete user mutation
  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleCreate = () => {
    createUser.mutate({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">API Fetcher Example</h2>

      <Button onClick={handleCreate} disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </Button>

      <div className="space-y-2">
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded border p-2"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteUser.mutate(user.id)}
              disabled={deleteUser.isPending}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
