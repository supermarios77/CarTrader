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
RUN --mount=type=cache,target=/root/.pnpm-store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install --frozen-lockfile --prefer-offline
RUN pnpm turbo run build --filter=@cartrader/api-gateway...
RUN --mount=type=cache,target=/root/.pnpm-store pnpm deploy --filter=@cartrader/api-gateway --prod --offline /out

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /out/ .
EXPOSE 3000
CMD ["node", "apps/api-gateway/dist/main.js"]
