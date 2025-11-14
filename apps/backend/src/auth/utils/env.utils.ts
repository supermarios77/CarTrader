import { Injectable, OnModuleInit } from '@nestjs/common';

/**
 * Get required environment variable or throw error
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please set it in your .env file or environment.`,
    );
  }
  return value;
}

/**
 * Validate all required JWT secrets are set
 * Call this during module initialization
 */
export function validateJwtSecrets(): void {
  getRequiredEnv('JWT_SECRET');
  getRequiredEnv('JWT_REFRESH_SECRET');
}

