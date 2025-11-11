# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
ENV PNPM_HOME="/root/.local/share/pnpm"
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json tsconfig.base.json eslint.config.mjs ./
COPY packages ./packages
COPY apps ./apps
RUN pnpm install --frozen-lockfile
ARG PRISMA_GENERATE_DB_URL="postgresql://placeholder:placeholder@localhost:5432/cartrader?schema=public"
ENV DATABASE_URL=$PRISMA_GENERATE_DB_URL
RUN PRISMA_GENERATE_SKIP_AUTOINSTALL=1 pnpm exec prisma generate --schema packages/database/prisma/schema.prisma
RUN pnpm turbo run build --filter=@cartrader/notifications-service...
RUN pnpm deploy --filter=@cartrader/notifications-service --prod /out

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /out/ .
EXPOSE 3040
CMD ["node", "apps/notifications-service/dist/main.js"]
