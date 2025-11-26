'use client';

import { SessionsManagementTable } from '@/components/admin/sessions-management-table';

export default function AdminSessionsPage() {
  return (
    <div className="container mx-auto space-y-6 px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Session Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage user sessions across all devices
        </p>
      </div>

      <SessionsManagementTable />
    </div>
  );
}
