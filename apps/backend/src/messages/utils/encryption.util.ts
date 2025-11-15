/**
 * Message Encryption Utility
 * Uses AES-256-GCM for authenticated encryption
 * Production-ready, secure, and fool-proof
 */

import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';
import { getRequiredEnv } from '../../auth/utils/env.utils';

const logger = new Logger('MessageEncryption');

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Get encryption key from environment variable
 * Falls back to a default key in development (NOT for production)
 */
function getEncryptionKey(): Buffer {
  const keyMaterial = getRequiredEnv('MESSAGE_ENCRYPTION_KEY', {
    defaultValue: process.env.NODE_ENV === 'production' ? undefined : 'dev-key-change-in-production-32-chars!!',
    description: 'Message encryption key (32+ characters)',
  });

  // Derive a consistent key using PBKDF2
  const salt = crypto.createHash('sha256').update(keyMaterial).digest();
  return crypto.pbkdf2Sync(keyMaterial, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt message content
 * @param plaintext - The message content to encrypt
 * @returns Encrypted content as base64 string
 */
export function encryptMessage(plaintext: string): string {
  try {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Invalid plaintext: must be a non-empty string');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const tag = cipher.getAuthTag();

    // Combine IV + tag + encrypted data
    // Format: base64(iv)::base64(tag)::base64(encrypted)
    const result = `${iv.toString('base64')}::${tag.toString('base64')}::${encrypted}`;

    logger.debug(`✅ Encrypted message (${plaintext.length} chars -> ${result.length} chars)`);
    return result;
  } catch (error) {
    logger.error(`❌ Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw new Error('Failed to encrypt message content');
  }
}

/**
 * Decrypt message content
 * @param ciphertext - The encrypted message content
 * @returns Decrypted content as string
 */
export function decryptMessage(ciphertext: string): string {
  try {
    if (!ciphertext || typeof ciphertext !== 'string') {
      throw new Error('Invalid ciphertext: must be a non-empty string');
    }

    // Split the encrypted data
    const parts = ciphertext.split('::');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format: expected IV::TAG::DATA');
    }

    const [ivBase64, tagBase64, encrypted] = parts;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    logger.debug(`✅ Decrypted message (${ciphertext.length} chars -> ${decrypted.length} chars)`);
    return decrypted;
  } catch (error) {
    logger.error(`❌ Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw new Error('Failed to decrypt message content');
  }
}

/**
 * Check if a string is encrypted (has the expected format)
 */
export function isEncrypted(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  const parts = text.split('::');
  return parts.length === 3 && parts.every((part) => {
    try {
      Buffer.from(part, 'base64');
      return true;
    } catch {
      return false;
    }
  });
}

