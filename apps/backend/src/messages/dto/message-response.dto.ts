import { MessageStatus } from '@prisma/client';

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

export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  vehicleId: string | null;
  subject: string | null;
  content: string; // Decrypted content
  status: MessageStatus;
  readAt: string | null;
  deletedAt: string | null; // When message was deleted (soft delete)
  editedAt: string | null; // When message was last edited
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
  messages: MessageResponse[];
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

