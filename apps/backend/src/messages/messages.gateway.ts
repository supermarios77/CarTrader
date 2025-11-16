import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type AuthenticatedSocket = Socket & { data: { userId?: string } };

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket'],
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        (typeof client.handshake.query?.token === 'string'
          ? (client.handshake.query.token as string)
          : undefined) ||
        (client.handshake.headers['authorization'] as string | undefined)?.replace(
          /^Bearer\s+/i,
          '',
        );

      if (!token) {
        this.logger.warn('Socket connection rejected: missing token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string }>(token);
      const userId = payload?.sub as string | undefined;
      if (!userId) {
        this.logger.warn('Socket connection rejected: invalid token payload');
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      // Join a personal room for direct events
      await client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} (user ${userId})`);
    } catch (err) {
      this.logger.warn(
        `Socket connection rejected: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(
      `Client disconnected: ${client.id} (user ${client.data?.userId || 'unknown'})`,
    );
  }

  // Emitters (called by service)
  emitMessageCreated(message: {
    id: string;
    senderId: string;
    receiverId: string;
    payload: unknown;
  }) {
    // Notify both sender and receiver
    this.server
      .to([`user:${message.senderId}`, `user:${message.receiverId}`])
      .emit('messages:new', message.payload);
  }

  emitMessageUpdated(message: {
    id: string;
    senderId: string;
    receiverId: string;
    payload: unknown;
  }) {
    this.server
      .to([`user:${message.senderId}`, `user:${message.receiverId}`])
      .emit('messages:updated', message.payload);
  }

  emitMessageDeleted(message: {
    id: string;
    senderId: string;
    receiverId: string;
    payload: unknown;
  }) {
    this.server
      .to([`user:${message.senderId}`, `user:${message.receiverId}`])
      .emit('messages:deleted', message.payload);
  }

  emitConversationRead(data: { readerId: string; partnerId: string }) {
    // Notify both participants their conversation read-state changed
    this.server
      .to([`user:${data.readerId}`, `user:${data.partnerId}`])
      .emit('messages:read', data);
  }
}

