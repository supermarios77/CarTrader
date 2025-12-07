'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Car, Heart, Bell, MessageSquare, ShoppingBag, CreditCard, Plus } from 'lucide-react';

type TabKey = 'ads' | 'saved' | 'rides' | 'alerts' | 'messages' | 'orders' | 'payment';

const TABS: { key: TabKey; label: string; href?: string; icon: React.ReactNode }[] = [
  { key: 'ads', label: 'My Ads', icon: <Car className="w-4 h-4" /> },
  { key: 'saved', label: 'Saved Ads', icon: <Heart className="w-4 h-4" /> },
  { key: 'rides', label: 'My Rides', icon: <Car className="w-4 h-4" /> },
  { key: 'alerts', label: 'My Alerts', icon: <Bell className="w-4 h-4" /> },
  { key: 'messages', label: 'Messages', href: '/messages', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
  { key: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('ads');

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return null;
    try {
      const d = new Date(user.createdAt);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return null;
    }
  }, [user?.createdAt]);

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-10">
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-10 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold mb-2">Please sign in to view your dashboard</h1>
                <p className="text-[#666]">Your ads, messages, and orders live here.</p>
              </div>
              <Link href="/login">
                <Button className="bg-[#111] text-white hover:bg-[#222]">Sign In</Button>
              </Link>
            </div>
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
        {/* Profile header */}
        <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-2xl font-semibold ring-2 ring-[#10b981]/20">
                {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="font-[var(--font-space-grotesk)] text-2xl font-semibold leading-tight">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || 'Your Account'}
                </h1>
                <p className="text-[#666] mt-1">
                  {memberSince ? <>Member since {memberSince}</> : 'Welcome back'}
                </p>
                <div className="mt-2 text-sm">
                  <Link href="/profile/edit" className="text-[#10b981] hover:text-[#059669] transition-colors">
                    Edit Profile
                  </Link>
                  <span className="mx-2 text-[#888]">|</span>
                  <Link href="/profile/change-password" className="text-[#10b981] hover:text-[#059669] transition-colors">
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
            <Link href="/post">
              <Button className="bg-[#10b981] text-white hover:bg-[#059669] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Post New Ad
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs row */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2">
            {TABS.map((t) => {
              const isActive = t.key === activeTab;
              const TabInner = (
                <button
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#111] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                      : 'bg-white border border-[#e5e5e5] text-[#666] hover:border-[#10b981] hover:text-[#10b981]'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
              return t.href ? (
                <Link key={t.key} href={t.href} onClick={() => setActiveTab(t.key)}>
                  {TabInner}
                </Link>
              ) : (
                <div key={t.key}>{TabInner}</div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[260px,1fr]">
          {/* Left status panel */}
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h3 className="font-[var(--font-space-grotesk)] font-semibold mb-4">Ads Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-full bg-[#f0fdf4] border border-[#10b981]/20 px-4 py-2.5">
                <span className="text-sm font-medium">Active</span>
                <span className="text-[#10b981] font-semibold">0</span>
              </div>
              <div className="flex items-center justify-between rounded-full bg-[#fef3c7] border border-yellow-300/20 px-4 py-2.5">
                <span className="text-sm font-medium">Pending</span>
                <span className="text-yellow-600 font-semibold">0</span>
              </div>
              <div className="flex items-center justify-between rounded-full bg-[#fee2e2] border border-red-300/20 px-4 py-2.5">
                <span className="text-sm font-medium">Removed</span>
                <span className="text-red-600 font-semibold">0</span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h3 className="font-[var(--font-space-grotesk)] font-semibold mb-6">
              {TABS.find((t) => t.key === activeTab)?.label ?? 'My Ads'}
            </h3>
            <div>
              {activeTab === 'ads' && (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <p className="text-lg font-semibold mb-2">No Active Ads</p>
                  <p className="text-[#666] mb-4">Post your first ad to get started.</p>
                  <Link href="/post">
                    <Button className="bg-[#10b981] text-white hover:bg-[#059669]">
                      Post an Ad
                    </Button>
                  </Link>
                </div>
              )}
              {activeTab === 'saved' && (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <p className="text-lg font-semibold mb-2">No Saved Ads</p>
                  <p className="text-[#666] mb-4">Browse vehicles and save the ones you like.</p>
                  <Link href="/vehicles">
                    <Button variant="outline" className="border-[#e5e5e5] hover:bg-[#fafafa]">
                      Browse Vehicles
                    </Button>
                  </Link>
                </div>
              )}
              {activeTab === 'rides' && (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-[#666]">No rides to show.</p>
                </div>
              )}
              {activeTab === 'alerts' && (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-[#666]">You haven't created any alerts yet.</p>
                </div>
              )}
              {activeTab === 'messages' && (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <p className="text-lg font-semibold mb-2">Messages</p>
                  <p className="text-[#666] mb-4">Open your inbox to continue conversations.</p>
                  <Link href="/messages">
                    <Button variant="outline" className="border-[#e5e5e5] hover:bg-[#fafafa]">
                      Open Messages
                    </Button>
                  </Link>
                </div>
              )}
              {activeTab === 'orders' && (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-[#666]">You don't have any orders yet.</p>
                </div>
              )}
              {activeTab === 'payment' && (
                <div className="space-y-3">
                  <p className="text-[#666]">Manage your billing methods and invoices here.</p>
                  <div className="rounded-xl bg-[#fafafa] border border-[#e5e5e5] p-4">
                    <p className="text-sm text-[#666]">Payments functionality coming soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
