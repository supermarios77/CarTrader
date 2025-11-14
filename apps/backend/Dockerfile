# Multi-stage build for production
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy only package files first (for better layer caching)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Dependencies stage
FROM base AS dependencies

# Install dependencies (cached unless package files change)
RUN pnpm install --frozen-lockfile --filter @cartrader/backend...

# Build stage
FROM base AS build

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages

# Copy source code (this layer rebuilds on code changes)
COPY packages ./packages
COPY apps/backend ./apps/backend

# Generate Prisma Client (cached unless schema changes)
WORKDIR /app/packages/prisma
RUN pnpm generate

# Build the application
WORKDIR /app/apps/backend
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=base --chown=nestjs:nodejs /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=base --chown=nestjs:nodejs /app/packages ./packages

# Install production dependencies only
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile --prod --filter @cartrader/backend...

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/
COPY --from=build --chown=nestjs:nodejs /app/packages/prisma ./packages/prisma

# Generate Prisma Client in production stage
# Install Prisma CLI temporarily (needed to generate client)
# Note: Prisma CLI is small (~5MB) and can stay in production
RUN pnpm add -D prisma --filter @cartrader/prisma

# Generate Prisma Client (required for runtime)
WORKDIR /app/packages/prisma
RUN pnpm generate
WORKDIR /app

# Install postgresql-client for health checks (before switching user)
RUN apk add --no-cache postgresql-client

# Copy entrypoint script
COPY --chown=nestjs:nodejs scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

