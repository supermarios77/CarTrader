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

'use client';

/**
 * User Dashboard Page
 * Displays user statistics, recent vehicles, and quick actions
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDashboard, type DashboardResponse } from '@/lib/dashboard-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import {
  Car,
  Heart,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  List,
  TrendingUp,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch dashboard data
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchDashboard() {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getDashboard();
        
        // Don't update state if request was aborted
        if (abortController.signal.aborted) return;
        
        setDashboard(data);
      } catch (err) {
        // Don't update state if request was aborted
        if (abortController.signal.aborted) return;
        
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    // Cleanup: abort request if component unmounts
    return () => {
      abortController.abort();
    };
  }, [isAuthenticated]);

  const formatPrice = (price: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-24 bg-muted rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { stats, recentVehicles } = dashboard;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back, {user?.firstName || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile/edit">
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/vehicles/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                List Vehicle
              </Button>
            </Link>
            <Link href="/vehicles">
              <Button variant="outline">
                <List className="mr-2 h-4 w-4" />
                Browse All
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeVehicles} active, {stats.draftVehicles} draft
              </p>
            </CardContent>
          </Card>

          {/* Active Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVehicles}</div>
              <p className="text-xs text-muted-foreground">
                Currently listed
              </p>
            </CardContent>
          </Card>

          {/* Total Favorites */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFavorites}</div>
              <p className="text-xs text-muted-foreground">
                Saved by users
              </p>
            </CardContent>
          </Card>

          {/* Total Views */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg {stats.averageViews} per vehicle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          {/* Draft Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Vehicles</CardTitle>
              <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftVehicles}</div>
              <p className="text-xs text-muted-foreground">
                Ready to publish
              </p>
            </CardContent>
          </Card>

          {/* Sold Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Vehicles</CardTitle>
              <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.soldVehicles}</div>
              <p className="text-xs text-muted-foreground">
                Completed sales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Vehicles</CardTitle>
            <Link href="/vehicles">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentVehicles.length === 0 ? (
              <div className="py-12 text-center">
                <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No vehicles yet</p>
                <Link href="/vehicles/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    List Your First Vehicle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentVehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/vehicles/${vehicle.id}`}
                    className="block"
                  >
                    <Card className="transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Vehicle Image */}
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            {vehicle.images && vehicle.images.length > 0 ? (
                              <img
                                src={vehicle.images[0].url}
                                alt={vehicle.images[0].alt || vehicle.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Car className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            {vehicle.status === 'ACTIVE' && (
                              <div className="absolute right-1 top-1 rounded-full bg-green-500 p-1">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {vehicle.status === 'DRAFT' && (
                              <div className="absolute right-1 top-1 rounded-full bg-yellow-500 p-1">
                                <FileText className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {vehicle.status === 'SOLD' && (
                              <div className="absolute right-1 top-1 rounded-full bg-gray-500 p-1">
                                <XCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Vehicle Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">
                                  {vehicle.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle.make.name} {vehicle.model.name} • {vehicle.category.name}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-primary">
                                  {formatPrice(vehicle.price, vehicle.currency)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{vehicle.views} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <span>{vehicle._count.favorites} favorites</span>
                              </div>
                              <span>{formatDate(vehicle.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/vehicles/new">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">List New Vehicle</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a new vehicle to your listings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/favorites">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <h3 className="font-semibold">My Favorites</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  View your saved vehicles
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vehicles">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <h3 className="font-semibold">Browse Vehicles</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore all available listings
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

