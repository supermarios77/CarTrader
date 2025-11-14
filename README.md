# CarTrader 🚗

A production-ready, self-hosted clone of PakWheels.com - a comprehensive automotive marketplace platform.

## Tech Stack

- **Backend**: NestJS + TypeScript + Prisma
- **Frontend**: Next.js 14+ (App Router) + TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Queue**: BullMQ
- **Real-time**: Socket.io
- **Infrastructure**: Docker + Docker Compose

## Project Structure

```
cartrader/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js App
├── packages/
│   ├── shared/           # Shared types, utils, constants
│   └── prisma/           # Prisma schema & client
└── docker/               # Docker configurations
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start development environment
docker-compose up -d
pnpm dev
```

## Development

This is a monorepo managed by pnpm workspaces.

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all code

## License

Private - All rights reserved
