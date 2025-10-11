'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Mock API functions
const fetchUsers = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  ];
};

const addUser = async (name: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
  };
};

export function ExampleQuery() {
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User added successfully!');
    },
    onError: () => {
      toast.error('Failed to add user');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading users: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-3">
        {users?.map((user) => (
          <div
            key={user.id}
            className="p-4 border rounded-lg flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={() => mutation.mutate('New User')}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Adding...' : 'Add User'}
      </Button>
    </div>
  );
}
