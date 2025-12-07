'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVehicle, deleteVehicle, publishVehicle, markVehicleAsSold } from '@/lib/vehicles-api';
import type { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/favorite-button';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Copy, MessageCircle } from 'lucide-react';
import { ReviewsSection } from '@/components/reviews/reviews-section';
import { SellerRating } from '@/components/reviews/seller-rating';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-white rounded-[20px] border border-[#e5e5e5]" />
            <div className="h-8 w-3/4 bg-white rounded-[20px] border border-[#e5e5e5]" />
            <div className="h-4 w-1/2 bg-white rounded-[20px] border border-[#e5e5e5]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-12 text-center">
            <p className="text-red-600 mb-4">{error || 'Vehicle not found'}</p>
            <Link href="/vehicles">
              <Button className="bg-[#111] text-white hover:bg-[#222]">
                Back to Listings
              </Button>
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
        {/* Breadcrumb / Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Listings
          </Link>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              } catch {
                // ignore
              }
            }}
            className="rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-xs text-[#666] hover:bg-[#fafafa] transition-colors flex items-center gap-2"
            aria-label="Copy link"
          >
            <Copy className="w-3 h-3" />
            Copy Link
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Favorite */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="font-[var(--font-space-grotesk)] text-4xl font-semibold mb-2">{vehicle.title}</h1>
                <p className="text-[#666]">
                  {vehicle.make.name} {vehicle.model.name} • {vehicle.year} • {vehicle.city}
                </p>
              </div>
              <FavoriteButton
                vehicleId={vehicle.id}
                isFavorite={vehicle.isFavorite}
                variant="button"
                onToggle={(isFav) => {
                  setVehicle((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
                }}
              />
            </div>

            {/* Images */}
            <div className="rounded-[20px] border border-[#e5e5e5] bg-white p-2 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              {vehicle.images && vehicle.images.length > 0 ? (
                (() => {
                  const imgs = vehicle.images;
                  const n = imgs.length;
                  if (n === 1) {
                    return (
                      <div className="relative h-[480px] w-full overflow-hidden rounded-xl">
                        <Image
                          src={imgs[0].url}
                          alt={imgs[0].alt || vehicle.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-cover"
                          priority
                        />
                      </div>
                    );
                  }
                  if (n === 2) {
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {imgs.slice(0, 2).map((img) => (
                          <div key={img.id} className="relative h-[420px] w-full overflow-hidden rounded-xl">
                            <Image
                              src={img.url}
                              alt={img.alt || vehicle.title}
                              fill
                              sizes="(max-width: 1024px) 50vw, 600px"
                              className="object-cover"
                              priority
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  if (n === 3) {
                    return (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <div className="relative h-[420px] w-full overflow-hidden rounded-xl">
                            <Image
                              src={imgs[0].url}
                              alt={imgs[0].alt || vehicle.title}
                              fill
                              sizes="(max-width: 1024px) 66vw, 800px"
                              className="object-cover"
                              priority
                            />
                          </div>
                        </div>
                        <div className="col-span-1 grid grid-rows-2 gap-2">
                          {imgs.slice(1, 3).map((img) => (
                            <div key={img.id} className="relative h-[206px] w-full overflow-hidden rounded-xl">
                              <Image
                                src={img.url}
                                alt={img.alt || vehicle.title}
                                fill
                                sizes="(max-width: 1024px) 33vw, 400px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  // 4 or more
                  return (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-4 md:col-span-3">
                        <div className="relative h-[420px] w-full overflow-hidden rounded-xl">
                          <Image
                            src={imgs[0].url}
                            alt={imgs[0].alt || vehicle.title}
                            fill
                            sizes="(max-width: 1024px) 75vw, 900px"
                            className="object-cover"
                            priority
                          />
                        </div>
                      </div>
                      <div className="col-span-4 grid grid-cols-4 gap-2 md:col-span-1 md:grid-cols-1">
                        {imgs.slice(1, 5).map((img) => (
                          <div key={img.id} className="relative h-24 w-full overflow-hidden rounded-lg">
                            <Image
                              src={img.url}
                              alt={img.alt || vehicle.title}
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex h-[420px] items-center justify-center text-[#888] bg-[#fafafa] rounded-xl">
                  No Images Available
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] text-xl font-semibold mb-4">Description</h2>
              <p className="text-[#666] whitespace-pre-wrap leading-relaxed">
                {vehicle.description || 'No description provided.'}
              </p>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <h2 className="font-[var(--font-space-grotesk)] text-xl font-semibold mb-4">Features</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {vehicle.features.map((feature) => (
                    <div key={feature.id} className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{feature.name}:</span>
                      <span className="text-[#666] text-sm">{feature.value || 'Yes'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Price & Info Card */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="mb-6">
                <div className="font-[var(--font-space-grotesk)] text-3xl font-bold text-[#10b981] mb-6">
                  {formatPrice(vehicle.price, vehicle.currency)}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#e5e5e5]">
                    <span className="text-[#666]">Year:</span>
                    <span className="font-semibold">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e5e5e5]">
                    <span className="text-[#666]">Mileage:</span>
                    <span className="font-semibold">{formatMileage(vehicle.mileage, vehicle.mileageUnit)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e5e5e5]">
                    <span className="text-[#666]">Transmission:</span>
                    <span className="font-semibold capitalize">{vehicle.transmission.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e5e5e5]">
                    <span className="text-[#666]">Fuel Type:</span>
                    <span className="font-semibold capitalize">{vehicle.fuelType.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e5e5e5]">
                    <span className="text-[#666]">Body Type:</span>
                    <span className="font-semibold capitalize">{vehicle.bodyType.toLowerCase()}</span>
                  </div>
                  {vehicle.engineCapacity && (
                    <div className="flex justify-between py-2 border-b border-[#e5e5e5]">
                      <span className="text-[#666]">Engine:</span>
                      <span className="font-semibold">{vehicle.engineCapacity} CC</span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="flex justify-between py-2 border-b border-[#e5e5e5]">
                      <span className="text-[#666]">Color:</span>
                      <span className="font-semibold capitalize">{vehicle.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-[#666]">Location:</span>
                    <span className="font-semibold">{vehicle.city}</span>
                  </div>
                  {vehicle.province && (
                    <div className="flex justify-between py-2">
                      <span className="text-[#666]">Province:</span>
                      <span className="font-semibold">{vehicle.province}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h3 className="font-[var(--font-space-grotesk)] font-semibold mb-4">Seller Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">
                    {vehicle.user.firstName} {vehicle.user.lastName}
                  </p>
                  <p className="text-sm text-[#666] mb-2">{vehicle.user.city || 'Location not specified'}</p>
                  <SellerRating sellerId={vehicle.user.id} />
                </div>
                {!isOwner && isAuthenticated && (
                  <Link href={`/messages/${vehicle.user.id}?vehicleId=${vehicle.id}`} className="block">
                    <Button className="w-full bg-[#111] text-white hover:bg-[#222] flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Contact Seller
                    </Button>
                  </Link>
                )}
                {!isOwner && !isAuthenticated && (
                  <Link href={`/login?redirect=/vehicles/${vehicle.id}`} className="block">
                    <Button variant="outline" className="w-full border-[#e5e5e5] text-[#111] hover:bg-[#fafafa]">
                      Sign in to Contact
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <h3 className="font-[var(--font-space-grotesk)] font-semibold mb-4">Manage Listing</h3>
                <div className="space-y-3">
                  {vehicle.status === 'DRAFT' && (
                    <Button
                      onClick={handlePublish}
                      disabled={actionLoading}
                      className="w-full bg-[#10b981] text-white hover:bg-[#059669]"
                    >
                      Publish Vehicle
                    </Button>
                  )}
                  {vehicle.status === 'ACTIVE' && (
                    <Button
                      onClick={handleMarkAsSold}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full border-[#e5e5e5] text-[#111] hover:bg-[#fafafa]"
                    >
                      Mark as Sold
                    </Button>
                  )}
                  <Link href={`/vehicles/${vehicle.id}/edit`} className="block">
                    <Button variant="outline" className="w-full border-[#e5e5e5] text-[#111] hover:bg-[#fafafa]">
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewsSection vehicleId={vehicleId} sellerId={vehicle.user.id} />
        </div>
      </div>
    </div>
  );
}
