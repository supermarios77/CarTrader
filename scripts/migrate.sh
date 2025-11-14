#!/bin/bash

# Prisma Migration Script
set -e

ENV=${1:-dev}

echo "🔄 Running Prisma migrations for $ENV environment..."

cd "$(dirname "$0")/../packages/prisma"

# Load environment variables properly (handles special characters)
load_env_file() {
  local env_file=$1
  if [ -f "$env_file" ]; then
    echo "📝 Loading environment from $env_file"
    # Parse .env file line by line, handling comments and special characters
    while IFS= read -r line || [ -n "$line" ]; do
      # Skip empty lines and comments
      [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
      
      # Remove leading/trailing whitespace
      line=$(echo "$line" | xargs)
      
      # Export the variable (handles values with special characters)
      if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        # Remove quotes if present
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        export "$key=$value"
      fi
    done < "$env_file"
    return 0
  fi
  return 1
}

# Try to load environment file
if ! load_env_file "../../.env.$ENV"; then
  if ! load_env_file "../../.env"; then
    echo "⚠️  No .env file found, using system environment variables"
  fi
fi

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  echo "Please set DATABASE_URL in your .env file"
  echo "Example: DATABASE_URL=postgresql://user:password@localhost:5432/database"
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Remove connection pool parameters for migrations (they can cause advisory lock timeouts)
# Keep only the basic connection string
CLEAN_DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/?.*$//')
if [[ "$DATABASE_URL" =~ schema=([^&]+) ]]; then
  SCHEMA="${BASH_REMATCH[1]}"
  CLEAN_DATABASE_URL="${CLEAN_DATABASE_URL}?schema=${SCHEMA}"
fi
export DATABASE_URL="$CLEAN_DATABASE_URL"

echo "📝 Using DATABASE_URL for migrations: ${DATABASE_URL//:[^:@]*@/:****@}"

if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  echo "📦 Deploying migrations to production..."
  pnpm migrate:deploy
else
  echo "🔨 Creating development migration..."
  pnpm migrate:dev
fi

echo "✅ Migrations completed!"

