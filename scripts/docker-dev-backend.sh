#!/bin/sh
set -e

echo "🔍 Checking backend dependencies..."

# Check if node_modules exist (they should be in anonymous volume)
if [ ! -d "/app/node_modules" ] || [ ! -d "/app/apps/backend/node_modules" ]; then
  echo "📦 Installing dependencies (this may take a moment)..."
  pnpm install --frozen-lockfile
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed"
fi

# Generate Prisma Client if needed
if [ ! -d "/app/packages/prisma/node_modules/.prisma" ]; then
  echo "📦 Generating Prisma Client..."
  cd /app/packages/prisma
  pnpm generate
  cd /app
fi

echo "🚀 Starting backend in watch mode..."
cd /app/apps/backend
exec pnpm dev

