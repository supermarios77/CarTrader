#!/bin/bash

# Prisma Seed Script
set -e

echo "🌱 Seeding database..."

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
if ! load_env_file "../../.env"; then
  echo "⚠️  No .env file found, using system environment variables"
fi

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  echo "Please set DATABASE_URL in your .env file"
  exit 1
fi

pnpm db:seed

echo "✅ Seeding completed!"

