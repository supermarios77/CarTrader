#!/bin/sh
set -e

echo "🔍 Checking frontend dependencies..."

# Check if node_modules exist (they should be in anonymous volume)
if [ ! -d "/app/node_modules" ] || [ ! -d "/app/apps/frontend/node_modules" ]; then
  echo "📦 Installing dependencies (this may take a moment)..."
  pnpm install --frozen-lockfile
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed"
fi

echo "🚀 Starting frontend in development mode..."
cd /app/apps/frontend
exec pnpm dev

