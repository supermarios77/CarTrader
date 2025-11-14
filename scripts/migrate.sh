#!/bin/bash

# Prisma Migration Script
set -e

ENV=${1:-dev}

echo "🔄 Running Prisma migrations for $ENV environment..."

cd "$(dirname "$0")/../packages/prisma"

# Load environment variables
if [ -f "../../.env.$ENV" ]; then
  export $(cat ../../.env.$ENV | grep -v '^#' | xargs)
elif [ -f "../../.env" ]; then
  export $(cat ../../.env | grep -v '^#' | xargs)
fi

if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  echo "📦 Deploying migrations to production..."
  pnpm migrate:deploy
else
  echo "🔨 Creating development migration..."
  pnpm migrate:dev
fi

echo "✅ Migrations completed!"

