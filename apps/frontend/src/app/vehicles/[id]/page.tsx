'use client';

/**
 * Vehicle Detail Page
 * Shows full details of a single vehicle
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVehicle, deleteVehicle, publishVehicle, markVehicleAsSold } from '@/lib/vehicles-api';
import type { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FavoriteButton } from '@/components/favorite-button';
import { useAuth } from '@/contexts/auth-context';
import { MessageSquare } from 'lucide-react';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch vehicle
  useEffect(() => {
    async function fetchVehicle() {
      setLoading(true);
      setError(null);
      try {
        const data = await getVehicle(vehicleId);
        setVehicle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Vehicle not found');
      } finally {
        setLoading(false);
      }
    }

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  const handleDelete = async () => {
    if (!vehicle || !confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteVehicle(vehicle.id);
      router.push('/vehicles');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!vehicle) return;

    setActionLoading(true);
    try {
      const updated = await publishVehicle(vehicle.id);
      setVehicle(updated);
      alert('Vehicle published successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!vehicle || !confirm('Mark this vehicle as sold?')) {
      return;
    }

    setActionLoading(true);
    try {
      const updated = await markVehicleAsSold(vehicle.id);
      setVehicle(updated);
      alert('Vehicle marked as sold!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as sold');
    } finally {
      setActionLoading(false);
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

  const isOwner = vehicle && user && vehicle.userId === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-8 w-3/4 bg-muted" />
            <div className="h-4 w-1/2 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive mb-4">{error || 'Vehicle not found'}</p>
              <Link href="/vehicles">
                <Button variant="outline">Back to Listings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        {/* Breadcrumb / Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/vehicles" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            ← Back to Listings
          </Link>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
              } catch {
                // ignore
              }
            }}
            className="rounded-md border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/5"
            aria-label="Copy link"
          >
            Copy Link
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Favorite */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">{vehicle.title}</h1>
                <p className="mt-2 text-muted-foreground">
                  {vehicle.make.name} {vehicle.model.name} • {vehicle.year} • {vehicle.city}
                </p>
              </div>
              <FavoriteButton
                vehicleId={vehicle.id}
                isFavorite={vehicle.isFavorite}
                variant="button"
                onToggle={(isFav) => {
                  setVehicle((prev) => prev ? { ...prev, isFavorite: isFav } : null);
                }}
              />
            </div>

            {/* Images */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
              {vehicle.images && vehicle.images.length > 0 ? (
                (() => {
                  const imgs = vehicle.images;
                  const n = imgs.length;
                  if (n === 1) {
                    return (
                      <img
                        src={imgs[0].url}
                        alt={imgs[0].alt || vehicle.title}
                        className="h-[480px] w-full rounded-xl object-cover"
                        loading="eager"
                        decoding="async"
                      />
                    );
                  }
                  if (n === 2) {
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {imgs.slice(0, 2).map((img) => (
                          <img
                            key={img.id}
                            src={img.url}
                            alt={img.alt || vehicle.title}
                            className="h-[420px] w-full rounded-xl object-cover"
                            loading="eager"
                            decoding="async"
                          />
                        ))}
                      </div>
                    );
                  }
                  if (n === 3) {
                    return (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <img
                            src={imgs[0].url}
                            alt={imgs[0].alt || vehicle.title}
                            className="h-[420px] w-full rounded-xl object-cover"
                            loading="eager"
                            decoding="async"
                          />
                        </div>
                        <div className="col-span-1 grid grid-rows-2 gap-2">
                          {imgs.slice(1, 3).map((img) => (
                            <img
                              key={img.id}
                              src={img.url}
                              alt={img.alt || vehicle.title}
                              className="h-[206px] w-full rounded-xl object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }
                  // 4 or more
                  return (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-4 md:col-span-3">
                        <img
                          src={imgs[0].url}
                          alt={imgs[0].alt || vehicle.title}
                          className="h-[420px] w-full rounded-xl object-cover"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                      <div className="col-span-4 grid grid-cols-4 gap-2 md:col-span-1 md:grid-cols-1">
                        {imgs.slice(1, 5).map((img) => (
                          <img
                            key={img.id}
                            src={img.url}
                            alt={img.alt || vehicle.title}
                            className="h-24 w-full rounded-lg object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex h-[420px] items-center justify-center text-gray-400">
                  No Images Available
                </div>
              )}
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {vehicle.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vehicle.features.map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2">
                        <span className="font-semibold">{feature.name}:</span>
                        <span className="text-muted-foreground">{feature.value || 'Yes'}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Price & Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{formatPrice(vehicle.price, vehicle.currency)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span className="font-semibold">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mileage:</span>
                    <span className="font-semibold">{formatMileage(vehicle.mileage, vehicle.mileageUnit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transmission:</span>
                    <span className="font-semibold capitalize">{vehicle.transmission.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuel Type:</span>
                    <span className="font-semibold capitalize">{vehicle.fuelType.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Body Type:</span>
                    <span className="font-semibold capitalize">{vehicle.bodyType.toLowerCase()}</span>
                  </div>
                  {vehicle.engineCapacity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engine:</span>
                      <span className="font-semibold">{vehicle.engineCapacity} CC</span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span className="font-semibold capitalize">{vehicle.color}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-semibold">{vehicle.city}</span>
                    </div>
                    {vehicle.province && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Province:</span>
                        <span className="font-semibold">{vehicle.province}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold">
                    {vehicle.user.firstName} {vehicle.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{vehicle.user.city || 'Location not specified'}</p>
                </div>
                {!isOwner && isAuthenticated && (
                  <Link href={`/messages/${vehicle.user.id}?vehicleId=${vehicle.id}`}>
                    <Button className="w-full">
                      Contact Seller
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Contact Seller CTA under Seller Info */}
            {!isOwner && isAuthenticated && (
              <Link href={`/messages/${vehicle.user.id}?vehicleId=${vehicle.id}`}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">
                  Contact Seller
                </Button>
              </Link>
            )}
            {!isOwner && !isAuthenticated && (
              <Link href={`/login?redirect=/vehicles/${vehicle.id}`}>
                <Button className="w-full" variant="outline">
                  Sign in to Contact
                </Button>
              </Link>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Listing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {vehicle.status === 'DRAFT' && (
                    <Button
                      onClick={handlePublish}
                      disabled={actionLoading}
                      className="w-full"
                    >
                      Publish Vehicle
                    </Button>
                  )}
                  {vehicle.status === 'ACTIVE' && (
                    <Button
                      onClick={handleMarkAsSold}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full"
                    >
                      Mark as Sold
                    </Button>
                  )}
                  <Link href={`/vehicles/${vehicle.id}/edit`}>
                    <Button variant="outline" className="w-full mb-2">
                      Edit Listing
                    </Button>
                  </Link>
                  <Button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    variant="destructive"
                    className="w-full"
                  >
                    Delete Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

