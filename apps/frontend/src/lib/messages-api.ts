/**
 * Messages API - Client functions for messaging endpoints
 */

import { api } from './api-client';

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export interface MessageUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface MessageVehicle {
  id: string;
  title: string;
  price: number;
  currency: string;
  year: number;
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string | null;
    isPrimary: boolean;
  }>;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  vehicleId: string | null;
  subject: string | null;
  content: string;
  status: MessageStatus;
  readAt: string | null;
  createdAt: string;
  sender: MessageUser;
  receiver: MessageUser;
  vehicle: MessageVehicle | null;
}

export interface ConversationSummary {
  partnerId: string;
  partner: MessageUser;
  vehicleId: string | null;
  vehicle: MessageVehicle | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    status: MessageStatus;
  };
  unreadCount: number;
  totalMessages: number;
}

export interface MessagesListResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConversationsListResponse {
  conversations: ConversationSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMessageData {
  receiverId: string;
  vehicleId?: string;
  subject?: string;
  content: string;
}

export interface GetMessagesParams {
  conversationPartnerId?: string;
  vehicleId?: string;
  status?: MessageStatus;
  page?: number;
  limit?: number;
}

/**
 * Send a message
 */
export async function sendMessage(
  data: CreateMessageData,
): Promise<Message> {
  return api.post<Message>('/messages', data);
}

/**
 * Get messages
 */
export async function getMessages(
  params?: GetMessagesParams,
): Promise<MessagesListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.conversationPartnerId) {
    queryParams.append('conversationPartnerId', params.conversationPartnerId);
  }
  if (params?.vehicleId) {
    queryParams.append('vehicleId', params.vehicleId);
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const query = queryParams.toString();
  return api.get<MessagesListResponse>(
    `/messages${query ? `?${query}` : ''}`,
  );
}

/**
 * Get conversations list
 */
export async function getConversations(
  page: number = 1,
  limit: number = 20,
): Promise<ConversationsListResponse> {
  return api.get<ConversationsListResponse>(
    `/messages/conversations?page=${page}&limit=${limit}`,
  );
}

/**
 * Get a single message
 */
export async function getMessageById(messageId: string): Promise<Message> {
  return api.get<Message>(`/messages/${messageId}`);
}

/**
 * Mark messages as read
 */
export async function markAsRead(
  partnerId: string,
): Promise<{ message: string; count: number }> {
  return api.put<{ message: string; count: number }>(
    `/messages/conversations/${partnerId}/read`,
  );
}

