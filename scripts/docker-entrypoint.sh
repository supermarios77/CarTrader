#!/bin/sh
set -e

echo "🚀 Starting CarTrader Backend..."

# Extract database connection details from DATABASE_URL if needed
# Format: postgresql://user:password@host:port/database
if [ -n "$DATABASE_URL" ]; then
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p' || echo "5432")
  DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
  
  # Wait for PostgreSQL to be ready
  echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" 2>/dev/null; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  echo "✅ PostgreSQL is ready!"
fi

# Run migrations in production
if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Running database migrations..."
  cd /app/packages/prisma
  pnpm migrate:deploy || echo "⚠️  Migration failed or already applied"
  echo "✅ Migrations check completed!"
fi

# Start the application
cd /app/apps/backend
exec node dist/main.js

