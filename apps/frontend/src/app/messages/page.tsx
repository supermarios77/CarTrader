'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getConversations, type ConversationSummary } from '@/lib/messages-api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { MessageSquare, User, Car, Search } from 'lucide-react';
import Image from 'next/image';

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

  useEffect(() => {
    // no-op; we rely on authLoading below
  }, [authLoading]);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchConversations() {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getConversations(1, 50);

        if (abortController.signal.aborted) return;

        setConversations(response.conversations);
      } catch (err) {
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

  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-[20px] bg-white border border-[#e5e5e5]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <MessageSquare className="w-16 h-16 text-[#10b981] mx-auto mb-4 opacity-50" />
            <p className="text-[#666] mb-4 text-lg">Please sign in to view your messages.</p>
            <Link href="/login?redirect=/messages">
              <Button className="bg-[#111] text-white hover:bg-[#222]">Sign In</Button>
            </Link>
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
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-[#10b981]" />
            <div>
              <h1 className="font-[var(--font-space-grotesk)] text-4xl font-semibold">Messages</h1>
              <p className="text-[#666] mt-1">Your conversations with sellers and buyers</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by person, vehicle, or last message..."
              className="w-full rounded-full border border-[#e5e5e5] bg-white pl-12 pr-4 py-3 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
              maxLength={120}
              aria-label="Search conversations"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Conversations List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <MessageSquare className="w-16 h-16 text-[#10b981] mx-auto mb-4 opacity-50" />
            <p className="text-[#666] mb-4 text-lg">
              {query.trim() ? 'No conversations match your search' : 'No conversations yet'}
            </p>
            <Link href="/vehicles">
              <Button className="bg-[#111] text-white hover:bg-[#222]">Browse Vehicles</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((conversation) => (
              <Link
                key={conversation.partnerId}
                href={`/messages/${conversation.partnerId}${conversation.vehicleId ? `?vehicleId=${conversation.vehicleId}` : ''}`}
              >
                <div className="group bg-white rounded-[20px] border border-[#e5e5e5] p-6 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-[#10b981]/20 cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {conversation.partner.avatar ? (
                        <Image
                          src={conversation.partner.avatar}
                          alt={getPartnerName(conversation.partner)}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-semibold">
                          {getPartnerName(conversation.partner)[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="truncate font-semibold">{getPartnerName(conversation.partner)}</h3>
                            {conversation.unreadCount > 0 && (
                              <span className="flex-shrink-0 rounded-full bg-[#10b981] px-2 py-0.5 text-xs font-semibold text-white">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.vehicle && (
                            <div className="mb-1 flex items-center gap-2 text-sm text-[#666]">
                              <Car className="h-4 w-4 text-[#10b981]" />
                              <span className="truncate">{conversation.vehicle.title}</span>
                            </div>
                          )}
                          <p className="truncate text-sm text-[#666]">{conversation.lastMessage.content}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-[#888]">{formatDate(conversation.lastMessage.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
