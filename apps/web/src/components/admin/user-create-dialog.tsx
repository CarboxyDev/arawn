'use client';

import type { Role } from '@repo/packages-types/role';
import { RoleSchema } from '@repo/packages-types/role';
import type { CreateUser } from '@repo/packages-types/user';
import { Button } from '@repo/packages-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/packages-ui/dialog';
import { Input } from '@repo/packages-ui/input';
import { Label } from '@repo/packages-ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/packages-ui/select';
import { UserPlus } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { useCreateUser } from '@/hooks/api/use-users';

const INITIAL_FORM_DATA: CreateUser = {
  name: '',
  email: '',
  role: 'user',
};

export function UserCreateDialog() {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateUser>(INITIAL_FORM_DATA);

  const { mutate: createUser, isPending } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createUser(formData, {
      onSuccess: () => {
        toast.success('User created successfully');
        setFormData(INITIAL_FORM_DATA);
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create user');
      },
    });
  };

  React.useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with role assignment
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter user name"
                required
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
                required
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value as Role }))
                }
              >
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {RoleSchema.options.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === 'super_admin'
                        ? 'Super Admin'
                        : role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
