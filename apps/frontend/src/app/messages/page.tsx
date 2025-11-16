'use client';

/**
 * Messages Page - Conversations List
 * Shows all conversations for the current user
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getConversations, type ConversationSummary } from '@/lib/messages-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { MessageSquare, User, Car } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const authCtx = useAuth() as any;
  const isAuthenticated = Boolean(authCtx?.isAuthenticated);
  const authLoading = Boolean(authCtx?.authLoading ?? authCtx?.loading ?? authCtx?.isLoading);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      const partner =
        (c.partner.firstName || '') +
        ' ' +
        (c.partner.lastName || '') +
        ' ' +
        (c.partner.email || '');
      const title = c.vehicle?.title || '';
      const last = c.lastMessage?.content || '';
      return (
        partner.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        last.toLowerCase().includes(q)
      );
    });
  }, [conversations, query]);

  // Wait for auth before fetching or showing CTA
  useEffect(() => {
    // no-op; we rely on authLoading below
  }, [authLoading]);

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

    if (!authLoading) {
      fetchConversations();
    }

    // Cleanup: abort request if component unmounts
    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, authLoading]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto max-w-5xl px-6 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-white/10 bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto max-w-5xl px-6 py-8">
          <Card className="mb-6 border-white/10 bg-white/5">
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-300">Please sign in to view your messages.</p>
              <Link href="/login?redirect=/messages">
                <Button className="bg-linear-to-r from-emerald-500 to-emerald-700 text-white">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto max-w-5xl px-6 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-white/10 bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-emerald-400" />
            <div>
              <h1 className="text-4xl font-bold">Messages</h1>
              <p className="mt-2 text-gray-400">
                Your conversations with sellers and buyers
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by person, vehicle, or last message..."
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500/50"
              maxLength={120}
              aria-label="Search conversations"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Conversations List */}
        {filtered.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-4 text-gray-300">
                {query.trim() ? 'No conversations match your search' : 'No conversations yet'}
              </p>
              <Link href="/vehicles">
                <Button className="bg-linear-to-r from-emerald-500 to-emerald-700 text-white">Browse Vehicles</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((conversation) => (
              <Link
                key={conversation.partnerId}
                href={`/messages/${conversation.partnerId}${conversation.vehicleId ? `?vehicleId=${conversation.vehicleId}` : ''}`}
              >
                <Card className="cursor-pointer border-white/10 bg-white/5 transition-colors hover:bg-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {conversation.partner.avatar ? (
                          <img
                            src={conversation.partner.avatar}
                            alt={getPartnerName(conversation.partner)}
                            className="h-12 w-12 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                            <User className="h-6 w-6 text-emerald-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="truncate font-semibold">
                                {getPartnerName(conversation.partner)}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="flex-shrink-0 rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            {conversation.vehicle && (
                              <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                                <Car className="h-4 w-4 text-emerald-400" />
                                <span className="truncate">{conversation.vehicle.title}</span>
                              </div>
                            )}
                            <p className="truncate text-sm text-gray-300">
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-gray-400">
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

