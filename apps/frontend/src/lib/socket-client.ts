'use client';

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api-client';

type MessageEvent =
  | 'messages:new'
  | 'messages:updated'
  | 'messages:deleted'
  | 'messages:read';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;

  const token = getAccessToken();
  // In dev, backend runs on port 3001
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(
    /\/+$/,
    '',
  );

  socket = io(baseUrl, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    auth: {
      token,
    },
  });

  // Minimal logging only in development
  if (process.env.NODE_ENV === 'development') {
    socket.on('connect', () => {
      console.log('[socket] connected', socket?.id);
    });
    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
    });
    socket.on('connect_error', (err) => {
      console.log('[socket] connect_error:', err.message);
    });
  }
  // Always refresh token before reconnect attempts
  type MutableAuthSocket = Socket & { auth: { token?: string } };
  socket.on('reconnect_attempt', () => {
    try {
      const fresh = getAccessToken();
      // mutate auth payload so server sees latest token
      // socket.io reads this object on each connect attempt
      (socket as MutableAuthSocket).auth = { token: fresh };
    } catch {
      // ignore
    }
  });

  return socket;
}

export function onSocket<T = any>(event: MessageEvent, handler: (payload: T) => void) {
  const s = getSocket();
  s.on(event, handler);
  return () => {
    s.off(event, handler);
  };
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


