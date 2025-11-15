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
import { useAuth } from '@/contexts/auth-context';

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
        console.error('Error fetching vehicle:', err);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/vehicles" className="mb-6 inline-block">
          <Button variant="ghost">← Back to Listings</Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div className="col-span-2">
                      <img
                        src={vehicle.images[0].url}
                        alt={vehicle.images[0].alt || vehicle.title}
                        className="h-96 w-full rounded-lg object-cover"
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    {vehicle.images.slice(1, 5).map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={image.alt || vehicle.title}
                        className="h-48 w-full rounded-lg object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EN/A%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-96 items-center justify-center bg-muted text-muted-foreground">
                    No Images Available
                  </div>
                )}
              </CardContent>
            </Card>

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
          <div className="space-y-6">
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
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">
                    {vehicle.user.firstName} {vehicle.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{vehicle.user.city || 'Location not specified'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Owner Actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Listing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
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
                    <Button variant="outline" className="w-full">
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

