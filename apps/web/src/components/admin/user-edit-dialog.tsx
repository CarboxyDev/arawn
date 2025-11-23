'use client';

import { RoleSchema } from '@repo/packages-types/role';
import type { UpdateUser, User } from '@repo/packages-types/user';
import { Pencil } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateUser } from '@/hooks/api/use-users';

interface UserEditDialogProps {
  user: User;
}

export function UserEditDialog({ user }: UserEditDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<UpdateUser>({
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const { mutate: updateUser, isPending } = useUpdateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const changes: UpdateUser = {};
    if (formData.name !== user.name) changes.name = formData.name;
    if (formData.email !== user.email) changes.email = formData.email;
    if (formData.role !== user.role) changes.role = formData.role;

    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateUser(
      { id: user.id, data: changes },
      {
        onSuccess: () => {
          toast.success('User updated successfully');
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update user');
        },
      }
    );
  };

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter user name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value as UpdateUser['role'],
                  }))
                }
              >
                <SelectTrigger id="role">
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
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
