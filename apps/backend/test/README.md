# E2E Tests

## Prerequisites

Before running e2e tests, ensure:

1. **Database is running**: The tests require a PostgreSQL database. You can either:
   - Use Docker Compose (from project root): `docker-compose -f docker-compose.dev.yml up -d postgres`
   - Or set `DATABASE_URL` environment variable to point to your test database

2. **Environment Variables**: The tests will use default values if not set:
   - `DATABASE_URL`: Defaults to `postgresql://cartrader_dev:dev_password@localhost:5432/cartrader_dev?schema=public`
   - `JWT_SECRET`: Defaults to `test-jwt-secret`
   - `JWT_REFRESH_SECRET`: Defaults to `test-jwt-refresh-secret`

   You can override these by setting environment variables:
   ```bash
   export DATABASE_URL="your-database-url"
   export JWT_SECRET="your-jwt-secret"
   export JWT_REFRESH_SECRET="your-refresh-secret"
   ```

## Running Tests

### Local Development (outside Docker)

```bash
# From the backend directory
# Make sure postgres is running (via Docker or locally)
pnpm test:e2e

# Or with custom database URL
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/testdb" pnpm test:e2e

# If connecting to Docker database from host
POSTGRES_HOST=localhost pnpm test:e2e
```

### Inside Docker Container

When running tests inside a Docker container (e.g., in CI/CD or Docker Compose):
- The `DATABASE_URL` environment variable is automatically set by docker-compose
- It will use `postgres` as the hostname (Docker service name)
- No additional configuration needed

```bash
# From the project root directory (where docker-compose.dev.yml is located)
cd /path/to/cartrader

# Run tests inside Docker container
docker-compose -f docker-compose.dev.yml exec backend pnpm test:e2e

# Or if you're already in the backend directory, use:
cd ../../ && docker-compose -f docker-compose.dev.yml exec backend pnpm test:e2e
```

## Test Coverage

The e2e tests cover:
- User registration (success, validation errors, duplicate email)
- User login (success, invalid credentials, validation)
- Token refresh (success, invalid token)
- User profile retrieval (with/without token)
- Session management (list, logout, revoke)
- Security checks (unauthorized access, invalid tokens)

