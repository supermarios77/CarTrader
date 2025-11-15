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

