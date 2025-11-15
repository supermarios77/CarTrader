'use client';

/**
 * Vehicle Listings Page
 * Displays all vehicles with filtering and search
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVehicles } from '@/lib/vehicles-api';
import type { Vehicle, VehicleFilters } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';

export default function VehiclesPage() {
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch vehicles
  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 [DEBUG] Fetching vehicles with filters:', {
          ...filters,
          search: searchQuery || undefined,
        });
        
        const response = await getVehicles({
          ...filters,
          search: searchQuery || undefined,
        });
        
        console.log('✅ [DEBUG] Vehicles API Response:', {
          vehiclesCount: response.vehicles.length,
          total: response.pagination.total,
          pagination: response.pagination,
          vehicles: response.vehicles.map(v => ({
            id: v.id,
            title: v.title,
            status: v.status,
            publishedAt: v.publishedAt,
            expiresAt: v.expiresAt,
            hasImages: v.images?.length > 0,
          })),
        });
        
        setVehicles(response.vehicles);
        setPagination(response.pagination);
      } catch (err) {
        console.error('❌ [DEBUG] Error fetching vehicles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, [filters, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Vehicle Listings</h1>
            <p className="mt-2 text-muted-foreground">
              Browse {pagination.total} vehicles
            </p>
            {/* Debug Info */}
            <div className="mt-4 rounded-lg border-2 border-blue-500/50 bg-blue-500/10 p-4 text-xs font-mono">
              <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🐛 DEBUG INFO</div>
              <div className="space-y-1 text-blue-900 dark:text-blue-200">
                <div>Loading: <span className={loading ? 'text-red-600' : 'text-green-600'}>{loading ? 'Yes' : 'No'}</span></div>
                <div>Vehicles in state: <span className="text-green-600">{vehicles.length}</span></div>
                <div>Total from API: <span className="text-green-600">{pagination.total}</span></div>
                <div>Current page: <span className="text-green-600">{pagination.page}</span></div>
                <div>Total pages: <span className="text-green-600">{pagination.totalPages}</span></div>
                <div>Search query: <span className="text-green-600">"{searchQuery || 'none'}"</span></div>
                <div>Filters: <span className="text-green-600">{JSON.stringify(filters, null, 2)}</span></div>
                {vehicles.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-500/30">
                    <div className="font-semibold mb-1">First vehicle:</div>
                    <div className="text-xs">
                      ID: {vehicles[0].id}<br/>
                      Title: {vehicles[0].title}<br/>
                      Status: <span className={vehicles[0].status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}>{vehicles[0].status}</span><br/>
                      Published: {vehicles[0].publishedAt ? new Date(vehicles[0].publishedAt).toLocaleString() : 'Not published'}<br/>
                      Expires: {vehicles[0].expiresAt ? new Date(vehicles[0].expiresAt).toLocaleString() : 'Never'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {isAuthenticated && (
            <Link href="/vehicles/new">
              <Button>List Your Vehicle</Button>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
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

        {/* Vehicle Grid */}
        {!loading && vehicles.length === 0 && (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-muted-foreground">No vehicles found</p>
              {isAuthenticated && (
                <Link href="/vehicles/new" className="mt-4 inline-block">
                  <Button variant="outline">List Your First Vehicle</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && vehicles.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                  <Card className="h-full transition-all hover:shadow-lg">
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
                            // Fallback to placeholder if image fails to load
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
                      {vehicle.featured && (
                        <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
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

                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg">
                        {vehicle.title}
                      </CardTitle>
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
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
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

