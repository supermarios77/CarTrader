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
COPY apps/frontend/package.json ./apps/frontend/

# Dependencies stage
FROM base AS dependencies

# Install dependencies (cached unless package files change)
RUN pnpm install --frozen-lockfile --filter @cartrader/frontend...

# Build stage
FROM base AS build

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages

# Copy source code (this layer rebuilds on code changes)
COPY packages ./packages
COPY apps/frontend ./apps/frontend

# Set build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
WORKDIR /app/apps/frontend
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=base --chown=nextjs:nodejs /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=base --chown=nextjs:nodejs /app/packages ./packages

# Install production dependencies only
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile --prod --filter @cartrader/frontend...

# Copy built application (standalone output includes everything needed)
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
WORKDIR /app
CMD ["node", "apps/frontend/server.js"]

