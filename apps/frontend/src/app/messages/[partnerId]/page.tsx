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
  type Message,
} from '@/lib/messages-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Send, User, Car } from 'lucide-react';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerId = params.partnerId as string;
  const vehicleId = searchParams.get('vehicleId');
  const { user, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

        // Don't update state if request was aborted
        if (abortController.signal.aborted) return;

        // Reverse to show oldest first
        setMessages(response.messages.reverse());

        // Mark as read
        try {
          await markAsRead(partnerId);
        } catch (err) {
          // Ignore mark as read errors
          console.error('Failed to mark as read:', err);
        }
      } catch (err) {
        // Don't update state if request was aborted
        if (abortController.signal.aborted) return;

        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        if (!abortController.signal.aborted) {
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || sending) return;

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

      // Add to messages list
      setMessages((prev) => [...prev, newMessage]);

      // Scroll to bottom
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessageContent(content); // Restore content on error
    } finally {
      setSending(false);
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
    const partner = message.senderId === user?.id ? message.receiver : message.sender;
    if (partner.firstName || partner.lastName) {
      return `${partner.firstName || ''} ${partner.lastName || ''}`.trim();
    }
    return partner.email.split('@')[0];
  };

  const currentPartner = messages[0]
    ? messages[0].senderId === user?.id
      ? messages[0].receiver
      : messages[0].sender
    : null;

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/messages">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Messages
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            {currentPartner?.avatar ? (
              <img
                src={currentPartner.avatar}
                alt={getPartnerName(messages[0])}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {currentPartner
                  ? getPartnerName(messages[0])
                  : 'Conversation'}
              </h1>
              {messages[0]?.vehicle && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Car className="h-4 w-4" />
                  <Link
                    href={`/vehicles/${messages[0].vehicle.id}`}
                    className="hover:underline"
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
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card className="mb-4">
          <CardContent className="p-0">
            <div
              ref={messagesContainerRef}
              className="h-[600px] overflow-y-auto p-6 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="mb-2">No messages yet</p>
                    <p className="text-sm">Start the conversation below</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            isOwnMessage
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-2">
            <Input
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message..."
              maxLength={5000}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={!messageContent.trim() || sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {messageContent.length}/5000 characters
          </p>
        </form>
      </div>
    </div>
  );
}

