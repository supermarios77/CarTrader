'use client';

/**
 * Conversation Detail Page
 * Shows messages between current user and a partner
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getMessages,
  sendMessage,
  markAsRead,
  updateMessage,
  deleteMessage,
  type Message,
} from '@/lib/messages-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Send, User, Car, Edit2, Trash2, X, Check } from 'lucide-react';
import { onSocket } from '@/lib/socket-client';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerId = params.partnerId as string;
  const vehicleId = searchParams.get('vehicleId');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Redirect if not authenticated (but wait for auth to load first)
  // Only redirect after auth loading is complete and user is definitely not authenticated
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      return;
    }
    
    // Only redirect if we're certain the user is not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch messages
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchMessages() {
      if (!isAuthenticated || !partnerId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getMessages({
          conversationPartnerId: partnerId,
          vehicleId: vehicleId || undefined,
          limit: 100,
        });

        // Don't update state if request was aborted or component unmounted
        if (abortController.signal.aborted || !isMountedRef.current) return;

        // Reverse to show oldest first (create new array to avoid mutating)
        const reversedMessages = [...response.messages].reverse();
        setMessages(reversedMessages);

        // Mark as read (don't wait for it)
        markAsRead(partnerId).catch(() => {
          // Silently ignore mark as read errors - non-critical operation
        });
      } catch (err) {
        // Don't update state if request was aborted or component unmounted
        if (abortController.signal.aborted || !isMountedRef.current) return;

        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        if (!abortController.signal.aborted && isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    fetchMessages();

    // Cleanup: abort request if component unmounts
    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, partnerId, vehicleId]);

  // Realtime updates
  useEffect(() => {
    if (!isAuthenticated) return;
    // New or updated messages
    const offNew = onSocket<Message>('messages:new', (msg) => {
      if (!isMountedRef.current) return;
      // Only append if this message belongs to this conversation (by partner)
      const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
      if (otherId !== partnerId) return;
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.find((m) => m.id === msg.id)) return prev.map((m) => (m.id === msg.id ? msg : m));
        return [...prev, msg];
      });
    });
    const offUpdated = onSocket<Message>('messages:updated', (msg) => {
      if (!isMountedRef.current) return;
      const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
      if (otherId !== partnerId) return;
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    });
    const offDeleted = onSocket<Message>('messages:deleted', (msg) => {
      if (!isMountedRef.current) return;
      const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
      if (otherId !== partnerId) return;
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    });
    // Read receipts can be used to optimistically update UI if needed
    const offRead = onSocket<{ readerId: string; partnerId: string }>('messages:read', () => {
      // No-op here; we already mark as read on fetch
    });
    return () => {
      offNew();
      offUpdated();
      offDeleted();
      offRead();
    };
  }, [isAuthenticated, partnerId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isMountedRef.current) return;

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Use timeout to ensure DOM is updated
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current && isMountedRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    // Cleanup timeout
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || sending || !isMountedRef.current) return;

    // Validate partnerId
    if (!partnerId || typeof partnerId !== 'string') {
      setError('Invalid conversation partner');
      return;
    }

    const content = messageContent.trim();
    setMessageContent('');
    setSending(true);
    setError(null);

    try {
      const newMessage = await sendMessage({
        receiverId: partnerId,
        vehicleId: vehicleId || undefined,
        content,
      });

        // Only update state if component is still mounted
      if (!isMountedRef.current) return;

        // Do not append here to avoid duplicates; the realtime 'messages:new'
        // event will deliver the created message to both participants promptly.
    } catch (err) {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessageContent(content); // Restore content on error
    } finally {
      if (isMountedRef.current) {
        setSending(false);
      }
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editContent.trim() || !isMountedRef.current) return;

    const content = editContent.trim();
    setError(null);

    try {
      const updatedMessage = await updateMessage(messageId, content);
      
      if (!isMountedRef.current) return;

      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
      );
      setEditingMessageId(null);
      setEditContent('');
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!isMountedRef.current || deletingMessageId === messageId) return;

    if (!confirm('Are you sure you want to delete this message? The other person will see that it was deleted.')) {
      return;
    }

    setDeletingMessageId(messageId);
    setError(null);

    try {
      const deletedMessage = await deleteMessage(messageId);
      
      if (!isMountedRef.current) return;

      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? deletedMessage : msg))
      );
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    } finally {
      if (isMountedRef.current) {
        setDeletingMessageId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getPartnerName = (message: Message) => {
    if (!message || !user) return 'Unknown';
    const partner = message.senderId === user.id ? message.receiver : message.sender;
    if (!partner) return 'Unknown';
    if (partner.firstName || partner.lastName) {
      return `${partner.firstName || ''} ${partner.lastName || ''}`.trim();
    }
    return partner.email?.split('@')[0] || 'Unknown';
  };

  const currentPartner = messages.length > 0 && messages[0] && user
    ? messages[0].senderId === user.id
      ? messages[0].receiver
      : messages[0].sender
    : null;

  // Wait for auth to load before showing anything or making redirect decisions
  if (authLoading) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white rounded-[20px] border border-[#e5e5e5]" />
            <div className="h-96 bg-white rounded-[20px] border border-[#e5e5e5]" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen via useEffect)
  // This prevents flash of content before redirect
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white rounded-[20px] border border-[#e5e5e5]" />
            <div className="h-96 bg-white rounded-[20px] border border-[#e5e5e5]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/messages">
            <Button variant="outline" className="mb-4 border-[#e5e5e5] hover:bg-[#fafafa]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Messages
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            {currentPartner?.avatar ? (
              <img
                src={currentPartner.avatar}
                alt={getPartnerName(messages[0] || null)}
                className="h-12 w-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-semibold">
                {currentPartner && messages.length > 0
                  ? getPartnerName(messages[0])[0]?.toUpperCase() || 'U'
                  : 'U'}
              </div>
            )}
            <div>
              <h1 className="font-[var(--font-space-grotesk)] text-2xl font-semibold">
                {currentPartner && messages.length > 0
                  ? getPartnerName(messages[0])
                  : 'Conversation'}
              </h1>
              {messages.length > 0 && messages[0]?.vehicle && (
                <div className="flex items-center gap-2 text-sm text-[#666] mt-1">
                  <Car className="h-4 w-4 text-[#10b981]" />
                  <Link
                    href={`/vehicles/${messages[0].vehicle.id}`}
                    className="hover:text-[#10b981] transition-colors"
                  >
                    {messages[0].vehicle.title}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="bg-white rounded-[20px] border border-[#e5e5e5] mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="p-0">
            <div ref={messagesContainerRef} className="h-[620px] overflow-y-auto p-6 space-y-5">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#666]">
                  <div className="text-center">
                    <p className="mb-2 text-lg">No messages yet</p>
                    <p className="text-sm">Start the conversation below</p>
                  </div>
                </div>
              ) : (
                messages.map((message, idx) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const isDeleted = !!message.deletedAt;
                  const isEdited = !!message.editedAt;
                  const isEditing = editingMessageId === message.id;
                  const isDeleting = deletingMessageId === message.id;
                  // Date divider
                  let showDateDivider = false;
                  if (idx === 0) {
                    showDateDivider = true;
                  } else {
                    const prev = messages[idx - 1];
                    const d1 = new Date(prev.createdAt);
                    const d2 = new Date(message.createdAt);
                    showDateDivider =
                      d1.getFullYear() !== d2.getFullYear() ||
                      d1.getMonth() !== d2.getMonth() ||
                      d1.getDate() !== d2.getDate();
                  }

                  return (
                    <div key={message.id}>
                      {showDateDivider && (
                        <div className="my-2 flex items-center justify-center">
                          <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-0.5 text-xs text-[#666]">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className={`mt-1 flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
                      {!isOwnMessage && (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-xs text-white font-semibold">
                          {getPartnerName(message).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-[20px] p-4 relative shadow-sm ${
                          isOwnMessage
                            ? 'bg-[#10b981] text-white'
                            : 'bg-white border border-[#e5e5e5] text-[#111]'
                        } ${isDeleted ? 'opacity-60' : ''}`}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              maxLength={5000}
                              className="rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="h-8"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveEdit(message.id)}
                                disabled={!editContent.trim() || editContent === message.content}
                                className="h-8"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isDeleted ? (
                              <p className="whitespace-pre-wrap wrap-break-word italic">
                                This message was deleted
                              </p>
                            ) : (
                              <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                                {message.content}
                              </p>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-xs ${
                                    isOwnMessage
                                      ? 'text-white/70'
                                      : 'text-[#666]'
                                  }`}
                                >
                                  {formatDate(message.createdAt)}
                                </p>
                                {isEdited && (
                                  <span
                                    className={`text-xs ${
                                      isOwnMessage
                                        ? 'text-white/70'
                                        : 'text-[#666]'
                                    }`}
                                    title={`Edited at ${new Date(message.editedAt).toLocaleString()}`}
                                  >
                                    (edited)
                                  </span>
                                )}
                                {isDeleted && (
                                  <span
                                    className={`text-xs ${
                                      isOwnMessage
                                        ? 'text-white/70'
                                        : 'text-[#666]'
                                    }`}
                                    title={`Deleted at ${new Date(message.deletedAt!).toLocaleString()}`}
                                  >
                                    (deleted)
                                  </span>
                                )}
                              </div>
                              {isOwnMessage && !isDeleted && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMessage(message)}
                                    className="h-6 w-6 p-0"
                                    title="Edit message"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMessage(message.id)}
                                    disabled={isDeleting}
                                    className="h-6 w-6 p-0"
                                    title="Delete message"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {isOwnMessage && (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-xs text-white font-semibold">
                          You
                        </div>
                      )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} aria-label="Send a message" className="bg-white rounded-[20px] border border-[#e5e5e5] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex gap-2">
            <Input
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message..."
              maxLength={5000}
              disabled={sending}
              className="flex-1 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
            />
            <Button
              type="submit"
              disabled={!messageContent.trim() || sending}
              className="rounded-full bg-[#10b981] text-white hover:bg-[#059669] h-12 w-12 p-0"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-[#666] mt-2 text-right">
            {messageContent.length}/5000 characters
          </p>
        </form>
      </div>
    </div>
  );
}

