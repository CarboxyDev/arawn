'use client';

import { UsersManagementTable } from '@/components/admin/users-management-table';

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      <UsersManagementTable />
    </div>
  );
}
