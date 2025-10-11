import { UserSchema, type User } from '@repo/shared-types';
import { slugify, formatDate } from '@repo/shared-utils';
import { Button } from '@/components/Button';

export default function Home() {
  const mockUser: User = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    email: 'user@example.com',
    name: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const validatedUser = UserSchema.parse(mockUser);
  const userSlug = slugify(validatedUser.name);
  const formattedDate = formatDate(validatedUser.createdAt);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Arawn Monorepo
        </h1>
        <div className="bg-gray-100 rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-semibold mb-4">User Info</h2>
          <p>
            <strong>Name:</strong> {validatedUser.name}
          </p>
          <p>
            <strong>Email:</strong> {validatedUser.email}
          </p>
          <p>
            <strong>Slug:</strong> {userSlug}
          </p>
          <p>
            <strong>Created:</strong> {formattedDate}
          </p>
        </div>
        <div className="flex justify-center">
          <Button />
        </div>
      </div>
    </main>
  );
}
