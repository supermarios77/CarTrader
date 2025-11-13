# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PNPM_STORE_DIR="/root/.pnpm-store"
ENV PNPM_FETCH_TIMEOUT=120000 \
    PNPM_FETCH_RETRIES=5 \
    PNPM_FETCH_RETRY_FACTOR=2 \
    PNPM_FETCH_RETRY_MINTIMEOUT=2000
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json tsconfig.base.json eslint.config.mjs ./
COPY packages ./packages
COPY apps ./apps
RUN --mount=type=cache,target=/root/.pnpm-store pnpm fetch --frozen-lockfile --filter=@cartrader/api-gateway...
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install --frozen-lockfile --prefer-offline --filter=@cartrader/api-gateway...
ARG PRISMA_GENERATE_DB_URL="postgresql://placeholder:placeholder@localhost:5432/cartrader?schema=public"
ENV DATABASE_URL=$PRISMA_GENERATE_DB_URL
RUN PRISMA_GENERATE_SKIP_AUTOINSTALL=1 pnpm exec prisma generate --schema packages/database/prisma/schema.prisma
RUN pnpm turbo run build --filter=@cartrader/api-gateway...
RUN --mount=type=cache,target=/root/.pnpm-store pnpm deploy --filter=@cartrader/api-gateway --prod --prefer-offline /out
# Copy generated Prisma client to deploy output
RUN cp -r node_modules/.prisma /out/node_modules/.prisma 2>/dev/null || true
RUN cp -r node_modules/@prisma /out/node_modules/@prisma 2>/dev/null || true

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /out/ .
EXPOSE 3000
CMD ["node", "dist/main.js"]
