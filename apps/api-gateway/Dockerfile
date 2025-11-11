# syntax=docker/dockerfile:1.6

ARG PNPM_VERSION=9.11.0
ARG PNPM_DOWNLOAD_URL="https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linuxstatic-x64"
ARG PNPM_SHA256=""
ARG PNPM_REGISTRY="https://registry.npmjs.org"

FROM node:20-alpine AS base
ARG PNPM_VERSION
ARG PNPM_DOWNLOAD_URL
ARG PNPM_SHA256
ARG PNPM_REGISTRY
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV npm_config_registry=$PNPM_REGISTRY
ENV PNPM_REGISTRY=$PNPM_REGISTRY
RUN --mount=type=bind,source=tools/pnpm/pnpm-linuxstatic-x64,target=/tmp/pnpm-local,readonly,optional \
    set -eux; \
    apk add --no-cache curl ca-certificates; \
    if [ -s /tmp/pnpm-local ]; then \
        install -m755 /tmp/pnpm-local /usr/local/bin/pnpm; \
    else \
        curl -fsSL --retry 5 --retry-delay 5 "$PNPM_DOWNLOAD_URL" -o /tmp/pnpm-download; \
        if [ -n "$PNPM_SHA256" ]; then echo "$PNPM_SHA256  /tmp/pnpm-download" | sha256sum -c -; fi; \
        install -m755 /tmp/pnpm-download /usr/local/bin/pnpm; \
        rm -f /tmp/pnpm-download; \
    fi; \
    apk del curl
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json tsconfig.base.json eslint.config.mjs ./
COPY apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY apps/auth-service/package.json ./apps/auth-service/package.json
COPY apps/listings-service/package.json ./apps/listings-service/package.json
COPY apps/media-service/package.json ./apps/media-service/package.json
COPY apps/notifications-service/package.json ./apps/notifications-service/package.json
COPY apps/orders-service/package.json ./apps/orders-service/package.json
COPY apps/payments-service/package.json ./apps/payments-service/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/logger/package.json ./packages/logger/package.json
COPY packages/observability/package.json ./packages/observability/package.json
RUN pnpm install --frozen-lockfile
COPY . .
ARG PRISMA_GENERATE_DB_URL="postgresql://placeholder:placeholder@localhost:5432/cartrader?schema=public"
ENV DATABASE_URL=${PRISMA_GENERATE_DB_URL}
RUN PRISMA_GENERATE_SKIP_AUTOINSTALL=1 pnpm exec prisma generate --schema packages/database/prisma/schema.prisma
RUN pnpm turbo run build --filter=@cartrader/api-gateway...

FROM deps AS deploy
RUN pnpm deploy --filter=@cartrader/api-gateway --prod /out

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deploy /out/ .
EXPOSE 3000
CMD ["node", "apps/api-gateway/dist/main.js"]
