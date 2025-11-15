/**
 * Socket.io Client for Real-time Messaging
 * Production-ready, type-safe, with reconnection handling
 */

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

/**
 * Get or create socket connection
 */
export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (socket?.connected) {
    return socket;
  }

  const token = getAccessToken();
  if (!token) {
    return null;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  // Create new socket connection
  socket = io(`${API_URL}/messages`, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Update socket auth token (after refresh)
 */
export function updateSocketToken(token: string): void {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
}

export { socket };

