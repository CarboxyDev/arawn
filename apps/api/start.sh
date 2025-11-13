#!/bin/sh
set -e

echo "🚀 Starting API deployment..."

# Wait for database to be ready (handles Railway sleep mode)
echo "⏳ Waiting for database to wake up..."

max_attempts=30
attempt=0

until npx prisma db push --accept-data-loss --skip-generate || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "   Database not ready yet (attempt $attempt/$max_attempts). Retrying in 2 seconds..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database connection failed after $max_attempts attempts"
  exit 1
fi

echo "✅ Database is ready!"

# Run migrations (production-safe, no prompts)
echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"

# Start the API server
echo "🎯 Starting API server..."
exec node dist/src/main.js
