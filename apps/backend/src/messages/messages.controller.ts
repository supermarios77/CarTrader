import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Send a message
   * POST /messages
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.sendMessage(userId, createMessageDto);
  }

  /**
   * Get messages (conversation)
   * GET /messages
   */
  @Get()
  async getMessages(
    @CurrentUser('id') userId: string,
    @Query() query: GetMessagesDto,
  ) {
    return this.messagesService.getMessages(userId, query);
  }

  /**
   * Get conversations list
   * GET /messages/conversations
   */
  @Get('conversations')
  async getConversations(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getConversations(
      userId,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Get a single message
   * GET /messages/:id
   */
  @Get(':id')
  async getMessageById(
    @Param('id', ParseUUIDPipe) messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.getMessageById(messageId, userId);
  }

  /**
   * Mark messages as read
   * PUT /messages/conversations/:partnerId/read
   */
  @Put('conversations/:partnerId/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.markAsRead(userId, partnerId);
  }

  /**
   * Update/edit a message
   * PATCH /messages/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateMessage(
    @Param('id', ParseUUIDPipe) messageId: string,
    @CurrentUser('id') userId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.updateMessage(messageId, userId, updateMessageDto);
  }

  /**
   * Delete a message (soft delete)
   * DELETE /messages/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteMessage(
    @Param('id', ParseUUIDPipe) messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.deleteMessage(messageId, userId);
  }
}

