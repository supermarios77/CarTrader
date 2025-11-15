import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import {
  MessageResponse,
  MessagesListResponse,
  ConversationsListResponse,
  ConversationSummary,
} from './dto/message-response.dto';
import { MessageStatus } from '@prisma/client';
import { encryptMessage, decryptMessage, isEncrypted } from './utils/encryption.util';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Send a message
   */
  async sendMessage(
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageResponse> {
    // Validate inputs
    if (!senderId || typeof senderId !== 'string') {
      throw new BadRequestException('Invalid sender ID');
    }

    if (!createMessageDto.receiverId || typeof createMessageDto.receiverId !== 'string') {
      throw new BadRequestException('Invalid receiver ID');
    }

    if (!createMessageDto.content || typeof createMessageDto.content !== 'string') {
      throw new BadRequestException('Message content is required');
    }

    // Validate receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: createMessageDto.receiverId },
      select: { id: true, status: true },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Check receiver status
    if (receiver.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot send message to inactive user');
    }

    // Prevent self-messaging
    if (senderId === createMessageDto.receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    // Validate vehicle if provided
    if (createMessageDto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: createMessageDto.vehicleId },
        select: { id: true, userId: true, status: true },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      // Allow vehicle owner to reply to messages about their vehicle
      // Only prevent if they're trying to message themselves (sender === receiver)
      // The vehicle owner can reply to buyers who contacted them
    }

    // Encrypt message content with error handling
    let encryptedContent: string;
    try {
      encryptedContent = encryptMessage(createMessageDto.content);
    } catch (error) {
      this.logger.error(
        `Failed to encrypt message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to encrypt message content');
    }

    // Create message with error handling
    let message;
    try {
      message = await this.prisma.message.create({
        data: {
          senderId,
          receiverId: createMessageDto.receiverId,
          vehicleId: createMessageDto.vehicleId || null,
          subject: createMessageDto.subject?.trim() || null,
          content: encryptedContent, // Store encrypted
          status: MessageStatus.SENT,
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              year: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                  isPrimary: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to create message');
    }

    // Decrypt content for response
    let decryptedContent: string;
    try {
      decryptedContent = decryptMessage(message.content);
    } catch (error) {
      this.logger.error(
        `Failed to decrypt newly created message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // This shouldn't happen, but handle gracefully
      throw new BadRequestException('Failed to decrypt message content');
    }

    this.logger.log(
      `✅ Message sent from ${senderId} to ${createMessageDto.receiverId}`,
    );

    return this.mapToResponse(message, decryptedContent);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    userId: string,
    query: GetMessagesDto,
  ): Promise<MessagesListResponse> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    // Filter by conversation partner
    if (query.conversationPartnerId) {
      where.AND = [
        {
          OR: [
            {
              senderId: userId,
              receiverId: query.conversationPartnerId,
            },
            {
              senderId: query.conversationPartnerId,
              receiverId: userId,
            },
          ],
        },
      ];
    }

    // Filter by vehicle
    if (query.vehicleId) {
      where.vehicleId = query.vehicleId;
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Get messages
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              year: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                  isPrimary: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    // Decrypt all messages with error handling
    const decryptedMessages = messages.map((msg) => {
      let decryptedContent: string;
      try {
        decryptedContent = isEncrypted(msg.content)
          ? decryptMessage(msg.content)
          : msg.content; // Fallback for unencrypted messages (migration)
      } catch (error) {
        this.logger.error(
          `Failed to decrypt message ${msg.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        // Return error message instead of failing completely
        decryptedContent = '[Message decryption failed]';
      }
      return this.mapToResponse(msg, decryptedContent);
    });

    return {
      messages: decryptedMessages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get conversations list (grouped by partner)
   */
  async getConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ConversationsListResponse> {
    const skip = (page - 1) * limit;

    // Get all unique conversation partners
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            year: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                isPrimary: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationMap = new Map<string, ConversationSummary>();

    for (const msg of messages) {
      const partnerId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!partnerId || !partner) {
        this.logger.warn(`Skipping message ${msg.id} with invalid partner`);
        continue;
      }

      if (!conversationMap.has(partnerId)) {
        // Decrypt last message content with error handling
        let decryptedContent: string;
        try {
          decryptedContent = isEncrypted(msg.content)
            ? decryptMessage(msg.content)
            : msg.content;
        } catch (error) {
          this.logger.error(
            `Failed to decrypt message ${msg.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          decryptedContent = '[Message decryption failed]';
        }

        conversationMap.set(partnerId, {
          partnerId,
          partner: {
            id: partner.id,
            email: partner.email,
            firstName: partner.firstName,
            lastName: partner.lastName,
            avatar: partner.avatar,
          },
          vehicleId: msg.vehicleId,
          vehicle: msg.vehicle
            ? {
                id: msg.vehicle.id,
                title: msg.vehicle.title,
                price: Number(msg.vehicle.price),
                currency: msg.vehicle.currency,
                year: msg.vehicle.year,
                images: msg.vehicle.images.map((img) => ({
                  id: img.id,
                  url: img.url,
                  thumbnailUrl: img.thumbnailUrl,
                  isPrimary: img.isPrimary,
                })),
              }
            : null,
          lastMessage: {
            id: msg.id,
            content: decryptedContent,
            createdAt: msg.createdAt.toISOString(),
            senderId: msg.senderId,
            status: msg.status,
          },
          unreadCount: 0, // Will calculate below
          totalMessages: 0, // Will calculate below
        });
      }
    }

    // Calculate unread counts and total messages per conversation
    const conversations = Array.from(conversationMap.values());
    for (const conv of conversations) {
      const [unreadCount, totalMessages] = await Promise.all([
        this.prisma.message.count({
          where: {
            OR: [
              {
                senderId: userId,
                receiverId: conv.partnerId,
              },
              {
                senderId: conv.partnerId,
                receiverId: userId,
              },
            ],
            receiverId: userId,
            status: { not: MessageStatus.READ },
          },
        }),
        this.prisma.message.count({
          where: {
            OR: [
              {
                senderId: userId,
                receiverId: conv.partnerId,
              },
              {
                senderId: conv.partnerId,
                receiverId: userId,
              },
            ],
          },
        }),
      ]);

      conv.unreadCount = unreadCount;
      conv.totalMessages = totalMessages;
    }

    // Sort by last message date
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime(),
    );

    // Paginate
    const paginatedConversations = conversations.slice(skip, skip + limit);

    return {
      conversations: paginatedConversations,
      pagination: {
        page,
        limit,
        total: conversations.length,
        totalPages: Math.ceil(conversations.length / limit),
      },
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(
    userId: string,
    conversationPartnerId: string,
  ): Promise<{ message: string; count: number }> {
    // Validate inputs
    if (!userId || !conversationPartnerId) {
      throw new BadRequestException('User ID and partner ID are required');
    }

    // Validate partner exists
    const partner = await this.prisma.user.findUnique({
      where: { id: conversationPartnerId },
      select: { id: true },
    });

    if (!partner) {
      throw new NotFoundException('Conversation partner not found');
    }

    try {
      const result = await this.prisma.message.updateMany({
        where: {
          senderId: conversationPartnerId,
          receiverId: userId,
          status: { not: MessageStatus.READ },
        },
        data: {
          status: MessageStatus.READ,
          readAt: new Date(),
        },
      });

      this.logger.log(
        `✅ Marked ${result.count} messages as read for user ${userId}`,
      );

      return {
        message: 'Messages marked as read',
        count: result.count,
      };
    } catch (error) {
      this.logger.error(
        `Failed to mark messages as read: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to mark messages as read');
    }
  }

  /**
   * Get a single message by ID
   */
  async getMessageById(
    messageId: string,
    userId: string,
  ): Promise<MessageResponse> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            year: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                isPrimary: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check authorization
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You do not have access to this message');
    }

    // Decrypt content with error handling
    let decryptedContent: string;
    try {
      decryptedContent = isEncrypted(message.content)
        ? decryptMessage(message.content)
        : message.content;
    } catch (error) {
      this.logger.error(
        `Failed to decrypt message ${messageId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to decrypt message content');
    }

    // Mark as read if user is receiver (don't wait for it)
    if (message.receiverId === userId && message.status !== MessageStatus.READ) {
      this.prisma.message
        .update({
          where: { id: messageId },
          data: {
            status: MessageStatus.READ,
            readAt: new Date(),
          },
        })
        .catch((error) => {
          this.logger.warn(
            `Failed to mark message ${messageId} as read: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          // Don't throw - this is a non-critical operation
        });
    }

    return this.mapToResponse(message, decryptedContent);
  }

  /**
   * Update/edit a message
   */
  async updateMessage(
    messageId: string,
    userId: string,
    updateMessageDto: { content: string },
  ): Promise<MessageResponse> {
    // Validate inputs
    if (!messageId || typeof messageId !== 'string') {
      throw new BadRequestException('Invalid message ID');
    }

    if (!updateMessageDto.content || typeof updateMessageDto.content !== 'string') {
      throw new BadRequestException('Message content is required');
    }

    if (updateMessageDto.content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    if (updateMessageDto.content.length > 5000) {
      throw new BadRequestException('Message content cannot exceed 5000 characters');
    }

    // Find message
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            year: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                isPrimary: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if message is deleted
    if (message.deletedAt) {
      throw new BadRequestException('Cannot edit a deleted message');
    }

    // Only sender can edit their message
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Encrypt new content
    let encryptedContent: string;
    try {
      encryptedContent = encryptMessage(updateMessageDto.content.trim());
    } catch (error) {
      this.logger.error(
        `Failed to encrypt message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to encrypt message content');
    }

    // Update message
    try {
      const updatedMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content: encryptedContent,
          editedAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              year: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                  isPrimary: true,
                },
              },
            },
          },
        },
      });

      // Decrypt for response
      let decryptedContent: string;
      try {
        decryptedContent = decryptMessage(updatedMessage.content);
      } catch (error) {
        this.logger.error(
          `Failed to decrypt updated message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw new BadRequestException('Failed to decrypt message content');
      }

      return this.mapToResponse(updatedMessage, decryptedContent);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to update message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to update message');
    }
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<MessageResponse> {
    // Validate inputs
    if (!messageId || typeof messageId !== 'string') {
      throw new BadRequestException('Invalid message ID');
    }

    // Find message
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            year: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                isPrimary: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if already deleted
    if (message.deletedAt) {
      throw new BadRequestException('Message is already deleted');
    }

    // Only sender can delete their message
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    // Soft delete message
    try {
      const deletedMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          deletedAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              year: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                  isPrimary: true,
                },
              },
            },
          },
        },
      });

      // Decrypt for response (even deleted messages should show content to receiver)
      let decryptedContent: string;
      try {
        decryptedContent = decryptMessage(deletedMessage.content);
      } catch (error) {
        this.logger.error(
          `Failed to decrypt deleted message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw new BadRequestException('Failed to decrypt message content');
      }

      return this.mapToResponse(deletedMessage, decryptedContent);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to delete message');
    }
  }

  /**
   * Map Prisma message to response DTO
   */
  private mapToResponse(
    message: any,
    decryptedContent: string,
  ): MessageResponse {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      vehicleId: message.vehicleId,
      subject: message.subject,
      content: decryptedContent,
      status: message.status,
      readAt: message.readAt?.toISOString() || null,
      deletedAt: message.deletedAt?.toISOString() || null,
      editedAt: message.editedAt?.toISOString() || null,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        firstName: message.sender.firstName,
        lastName: message.sender.lastName,
        avatar: message.sender.avatar,
      },
      receiver: {
        id: message.receiver.id,
        email: message.receiver.email,
        firstName: message.receiver.firstName,
        lastName: message.receiver.lastName,
        avatar: message.receiver.avatar,
      },
      vehicle: message.vehicle
        ? {
            id: message.vehicle.id,
            title: message.vehicle.title,
            price: Number(message.vehicle.price),
            currency: message.vehicle.currency,
            year: message.vehicle.year,
            images: message.vehicle.images.map((img: any) => ({
              id: img.id,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
              isPrimary: img.isPrimary,
            })),
          }
        : null,
    };
  }
}

