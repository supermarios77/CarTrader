'use client';

/**
 * Favorites Page
 * Displays all vehicles favorited by the current user
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFavorites, removeFavorite } from '@/lib/favorites-api';
import type { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FavoriteButton } from '@/components/favorite-button';
import { useAuth } from '@/contexts/auth-context';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch favorites
  useEffect(() => {
    async function fetchFavorites() {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getFavorites(pagination.page, pagination.limit);
        setVehicles(response.vehicles);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [isAuthenticated, pagination.page, pagination.limit]);

  const handleRemoveFavorite = async (vehicleId: string) => {
    try {
      await removeFavorite(vehicleId);
      // Remove from local state
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
    }
  };

  const formatPrice = (price: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number, unit: string = 'km') => {
    return `${mileage.toLocaleString()} ${unit}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">My Favorites</h1>
          <p className="mt-2 text-muted-foreground">
            {pagination.total} saved {pagination.total === 1 ? 'vehicle' : 'vehicles'}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-4 w-3/4 bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-1/2 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-muted-foreground mb-4">No favorites yet</p>
              <Link href="/vehicles">
                <Button variant="outline">Browse Vehicles</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Favorites Grid */}
        {!loading && vehicles.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="h-full transition-all hover:shadow-lg">
                  <Link href={`/vehicles/${vehicle.id}`}>
                    {/* Vehicle Image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-muted">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img
                          src={vehicle.images[0].url}
                          alt={vehicle.images[0].alt || vehicle.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.image-error')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'image-error flex h-full items-center justify-center text-muted-foreground';
                              placeholder.textContent = 'Image not available';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      {/* Favorite Button */}
                      <FavoriteButton
                        vehicleId={vehicle.id}
                        isFavorite={true}
                        onToggle={(isFav) => {
                          if (!isFav) {
                            handleRemoveFavorite(vehicle.id);
                          }
                        }}
                      />
                      {vehicle.featured && (
                        <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                          Featured
                        </div>
                      )}
                      {vehicle.status === 'SOLD' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="rounded-lg bg-destructive px-4 py-2 text-lg font-bold text-white">
                            SOLD
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <CardHeader>
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <CardTitle className="line-clamp-2 text-lg hover:text-primary">
                        {vehicle.title}
                      </CardTitle>
                    </Link>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(vehicle.price, vehicle.currency)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>{vehicle.year}</span>
                        <span>{formatMileage(vehicle.mileage, vehicle.mileageUnit)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{vehicle.make.name} {vehicle.model.name}</span>
                        <span>{vehicle.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{vehicle.transmission.toLowerCase()}</span>
                        <span>•</span>
                        <span className="capitalize">{vehicle.fuelType.toLowerCase()}</span>
                        <span>•</span>
                        <span className="capitalize">{vehicle.bodyType.toLowerCase()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

