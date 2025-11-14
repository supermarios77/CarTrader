#!/bin/bash

# Prisma Seed Script
set -e

echo "🌱 Seeding database..."

cd "$(dirname "$0")/../packages/prisma"

# Load environment variables
if [ -f "../../.env" ]; then
  export $(cat ../../.env | grep -v '^#' | xargs)
fi

pnpm db:seed

echo "✅ Seeding completed!"

