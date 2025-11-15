/**
 * Messages WebSocket Gateway
 * Handles real-time messaging via Socket.io
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

/**
 * AuthenticatedSocket extends Socket with userId property
 * All Socket methods are available through inheritance
 */
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token: string | undefined =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.query?.token as string | undefined) ||
        (client.handshake.headers?.authorization as string | undefined)?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token as string,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      if (!payload || !payload.sub) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      // Store userId on socket (JWT uses 'sub' for user ID)
      client.userId = payload.sub;

      // Track connected user
      if (!this.connectedUsers.has(payload.sub)) {
        this.connectedUsers.set(payload.sub, new Set());
      }
      this.connectedUsers.get(payload.sub)!.add(client.id);

      // Join user's personal room
      await client.join(`user:${payload.sub}`);

      this.logger.log(`✅ User ${payload.sub} connected (socket ${client.id})`);
    } catch (error) {
      this.logger.error(
        `❌ Connection error for client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
        }
      }
      this.logger.log(
        `👋 User ${client.userId} disconnected (socket ${client.id})`,
      );
    }
  }

  /**
   * Send a message
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CreateMessageDto & { vehicleId?: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      // Create message via service
      const message = await this.messagesService.sendMessage(
        client.userId,
        {
          receiverId: data.receiverId,
          vehicleId: data.vehicleId,
          subject: data.subject,
          content: data.content,
        },
      );

      // Emit to receiver if online
      this.server.to(`user:${data.receiverId}`).emit('new_message', message);

      // Confirm to sender
      client.emit('message_sent', message);

      this.logger.log(
        `📨 Message sent from ${client.userId} to ${data.receiverId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.emit('error', {
        message:
          error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }

  /**
   * Mark messages as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationPartnerId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    try {
      const result = await this.messagesService.markAsRead(
        client.userId,
        data.conversationPartnerId,
      );

      // Notify partner that messages were read
      this.server
        .to(`user:${data.conversationPartnerId}`)
        .emit('messages_read', {
          conversationPartnerId: client.userId,
          count: result.count,
        });

      client.emit('read_confirmed', result);
    } catch (error) {
      this.logger.error(
        `❌ Error marking as read: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.emit('error', {
        message:
          error instanceof Error ? error.message : 'Failed to mark as read',
      });
    }
  }

  /**
   * Get online status of users
   */
  @SubscribeMessage('check_online')
  handleCheckOnline(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userIds: string[] },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const onlineStatus: Record<string, boolean> = {};
    for (const userId of data.userIds) {
      onlineStatus[userId] = this.connectedUsers.has(userId);
    }

    client.emit('online_status', onlineStatus);
  }
}

