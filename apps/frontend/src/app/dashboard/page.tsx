'use client';

/**
 * Dashboard Page
 * PakWheels-inspired layout using our UI and dark theme.
 * Tabs: My Ads, Saved Ads, My Rides, My Alerts, My Messages, My Orders, Payment
 * Left status panel: Active / Pending / Removed
 * Main area shows tab content with robust empty states.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type TabKey = 'ads' | 'saved' | 'rides' | 'alerts' | 'messages' | 'orders' | 'payment';

const TABS: { key: TabKey; label: string; href?: string }[] = [
  { key: 'ads', label: 'My Ads' },
  { key: 'saved', label: 'My Saved Ads' },
  { key: 'rides', label: 'My Rides' },
  { key: 'alerts', label: 'My Alerts' },
  { key: 'messages', label: 'My Messages', href: '/messages' },
  { key: 'orders', label: 'My Orders' },
  { key: 'payment', label: 'Payment' },
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
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Please sign in to view your dashboard</h1>
                <p className="text-muted-foreground mt-1">Your ads, messages, and orders live here.</p>
              </div>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                <span className="text-2xl font-semibold">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-tight">{user?.name ?? 'Your Account'}</h1>
                <p className="text-muted-foreground">
                  {memberSince ? <>Member since {memberSince}</> : 'Welcome back'}
                </p>
                <div className="mt-1 text-sm">
                  <Link href="/profile/edit" className="text-primary hover:underline">
                    Edit Profile
                  </Link>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <Link href="/profile/change-password" className="text-primary hover:underline">
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs row */}
      <div className="mb-6 overflow-x-auto">
        <div className="grid grid-flow-col gap-2 md:auto-cols-max">
          {TABS.map((t) => {
            const isActive = t.key === activeTab;
            const TabInner = (
              <button
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                    : 'bg-white/5 text-foreground/80 ring-1 ring-white/10 hover:bg-white/7.5'
                }`}
              >
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ads Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <span>Active</span>
              <span className="text-muted-foreground">0</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <span>Pending</span>
              <span className="text-muted-foreground">0</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <span>Removed</span>
              <span className="text-muted-foreground">0</span>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {TABS.find((t) => t.key === activeTab)?.label ?? 'My Ads'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Content per tab. For now, robust empty states with hints. */}
            {activeTab === 'ads' && (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <p className="text-lg font-medium">No Active Ads</p>
                <p className="text-muted-foreground mt-1">Post your first ad to get started.</p>
                <Link href="/post" className="mt-4">
                  <Button>Post an Ad</Button>
                </Link>
              </div>
            )}
            {activeTab === 'saved' && (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <p className="text-lg font-medium">No Saved Ads</p>
                <p className="text-muted-foreground mt-1">Browse vehicles and save the ones you like.</p>
                <Link href="/vehicles" className="mt-4">
                  <Button variant="secondary">Browse Vehicles</Button>
                </Link>
              </div>
            )}
            {activeTab === 'rides' && (
              <div className="flex h-48 items-center justify-center">
                <p className="text-muted-foreground">No rides to show.</p>
              </div>
            )}
            {activeTab === 'alerts' && (
              <div className="flex h-48 items-center justify-center">
                <p className="text-muted-foreground">You haven’t created any alerts yet.</p>
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <p className="text-lg font-medium">Messages</p>
                <p className="text-muted-foreground mt-1">Open your inbox to continue conversations.</p>
                <Link href="/messages" className="mt-4">
                  <Button variant="secondary">Open Messages</Button>
                </Link>
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="flex h-48 items-center justify-center">
                <p className="text-muted-foreground">You don’t have any orders yet.</p>
              </div>
            )}
            {activeTab === 'payment' && (
              <div className="space-y-3">
                <p className="text-muted-foreground">Manage your billing methods and invoices here.</p>
                <div className="rounded-md bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-sm text-muted-foreground">Payments functionality coming soon.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

