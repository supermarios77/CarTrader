'use client';

/**
 * Messages Page - Conversations List
 * Shows all conversations for the current user
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getConversations, type ConversationSummary } from '@/lib/messages-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { MessageSquare, User, Car } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch conversations
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchConversations() {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getConversations(1, 50);

        // Don't update state if request was aborted
        if (abortController.signal.aborted) return;

        setConversations(response.conversations);
      } catch (err) {
        // Don't update state if request was aborted
        if (abortController.signal.aborted) return;

        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchConversations();

    // Cleanup: abort request if component unmounts
    return () => {
      abortController.abort();
    };
  }, [isAuthenticated]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getPartnerName = (partner: ConversationSummary['partner']) => {
    if (partner.firstName || partner.lastName) {
      return `${partner.firstName || ''} ${partner.lastName || ''}`.trim();
    }
    return partner.email.split('@')[0];
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Messages</h1>
              <p className="mt-2 text-muted-foreground">
                Your conversations with sellers and buyers
              </p>
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

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No conversations yet</p>
              <Link href="/vehicles">
                <Button>Browse Vehicles</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.partnerId}
                href={`/messages/${conversation.partnerId}${conversation.vehicleId ? `?vehicleId=${conversation.vehicleId}` : ''}`}
              >
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {conversation.partner.avatar ? (
                          <img
                            src={conversation.partner.avatar}
                            alt={getPartnerName(conversation.partner)}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {getPartnerName(conversation.partner)}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            {conversation.vehicle && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Car className="h-4 w-4" />
                                <span className="truncate">{conversation.vehicle.title}</span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(conversation.lastMessage.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

