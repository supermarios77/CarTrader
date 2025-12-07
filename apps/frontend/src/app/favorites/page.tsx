'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFavorites, removeFavorite } from '@/lib/favorites-api';
import type { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/favorite-button';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';
import { Heart } from 'lucide-react';

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchFavorites() {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getFavorites(pagination.page, pagination.limit);

        if (abortController.signal.aborted) return;

        setVehicles(response.vehicles);
        setPagination(response.pagination);
      } catch (err) {
        if (abortController.signal.aborted) return;

        setError(err instanceof Error ? err.message : 'Failed to load favorites');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchFavorites();

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, pagination.page, pagination.limit]);

  const handleRemoveFavorite = async (vehicleId: string) => {
    try {
      await removeFavorite(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setPagination((prev) => {
        const newTotal = Math.max(0, prev.total - 1);
        const newTotalPages = Math.ceil(newTotal / prev.limit);
        return {
          ...prev,
          total: newTotal,
          totalPages: newTotalPages,
          page: prev.page > newTotalPages && newTotalPages > 0 ? newTotalPages : prev.page,
        };
      });
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
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-[#10b981]" />
            <h1 className="font-[var(--font-space-grotesk)] text-4xl font-semibold">My Favorites</h1>
          </div>
          <p className="text-[#666]">
            {pagination.total} saved {pagination.total === 1 ? 'vehicle' : 'vehicles'}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse bg-white rounded-[20px] border border-[#e5e5e5]" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <Heart className="w-16 h-16 text-[#10b981] mx-auto mb-4 opacity-50" />
            <p className="text-[#666] mb-4 text-lg">No favorites yet</p>
            <Link href="/vehicles">
              <Button className="bg-[#111] text-white hover:bg-[#222]">Browse Vehicles</Button>
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && vehicles.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
                >
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <div className="relative w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5]">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <Image
                          src={vehicle.images[0].url}
                          alt={vehicle.images[0].alt || vehicle.title}
                          width={400}
                          height={240}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                          <span className="text-white text-4xl">🚗</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton
                          vehicleId={vehicle.id}
                          isFavorite={true}
                          onToggle={(isFav) => {
                            if (!isFav) {
                              handleRemoveFavorite(vehicle.id);
                            }
                          }}
                        />
                      </div>
                      {vehicle.featured && (
                        <div className="absolute top-3 left-3 bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      )}
                      {vehicle.status === 'SOLD' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          <span className="rounded-full bg-red-600 px-4 py-2 text-lg font-bold text-white">
                            SOLD
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-[#10b981]">
                        {formatPrice(Number(vehicle.price), vehicle.currency)}
                      </div>
                    </div>
                  </Link>

                  <div>
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <h3 className="font-semibold text-base mb-1 line-clamp-2 hover:text-[#10b981] transition-colors">
                        {vehicle.title}
                      </h3>
                    </Link>
                    <div className="space-y-2 text-sm text-[#666]">
                      <div className="flex items-center justify-between">
                        <span>{vehicle.year}</span>
                        <span>{formatMileage(vehicle.mileage, vehicle.mileageUnit)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          {vehicle.make.name} {vehicle.model.name}
                        </span>
                        <span>{vehicle.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="capitalize">{vehicle.transmission.toLowerCase()}</span>
                        <span>•</span>
                        <span className="capitalize">{vehicle.fuelType.toLowerCase()}</span>
                        <span>•</span>
                        <span className="capitalize">{vehicle.bodyType.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#666]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  className="border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
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
