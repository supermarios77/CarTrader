-- Initialize database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- This file runs after database creation

-- Set timezone
SET timezone = 'UTC';

