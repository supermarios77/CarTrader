# E2E Tests

## Prerequisites

Before running e2e tests, ensure:

1. **Database is running**: The tests require a PostgreSQL database. You can either:
   - Use Docker Compose: `docker-compose -f docker-compose.dev.yml up -d postgres`
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

```bash
# From the backend directory
pnpm test:e2e

# Or with custom database URL
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/testdb" pnpm test:e2e
```

## Test Coverage

The e2e tests cover:
- User registration (success, validation errors, duplicate email)
- User login (success, invalid credentials, validation)
- Token refresh (success, invalid token)
- User profile retrieval (with/without token)
- Session management (list, logout, revoke)
- Security checks (unauthorized access, invalid tokens)

