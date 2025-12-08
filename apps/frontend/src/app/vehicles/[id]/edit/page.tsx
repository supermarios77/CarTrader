'use client';

/**
 * Edit Vehicle Page
 * Form to edit an existing vehicle listing
 * Only the owner can edit their vehicle
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVehicle, updateVehicle } from '@/lib/vehicles-api';
import type { Vehicle, UpdateVehicleData } from '@/types/vehicle';
import { getCategories, getMakes, getModels, type Category, type Make, type Model } from '@/lib/catalog-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import {
  TransmissionType,
  FuelType,
  BodyType,
} from '@/types/vehicle';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const authCtx = useAuth() as any;
  const user = authCtx?.user;
  const isAuthenticated = Boolean(authCtx?.isAuthenticated);
  const authLoading = Boolean(authCtx?.authLoading ?? authCtx?.loading);
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Catalog data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState({
    categories: true,
    makes: false,
    models: false,
  });

  const [formData, setFormData] = useState<UpdateVehicleData>({
    categoryId: '',
    makeId: '',
    modelId: '',
    title: '',
    description: '',
    price: 0,
    currency: 'PKR',
    year: new Date().getFullYear(),
    mileage: 0,
    mileageUnit: 'km',
    transmission: TransmissionType.MANUAL,
    fuelType: FuelType.PETROL,
    bodyType: BodyType.SEDAN,
    city: '',
    province: '',
  });

  // Load vehicle and check ownership
  useEffect(() => {
    async function loadVehicle() {
      if (!vehicleId || !isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getVehicle(vehicleId);
        
        // Check ownership
        if (data.userId !== user?.id) {
          setError('You can only edit your own vehicles');
          router.push(`/vehicles/${vehicleId}`);
          return;
        }

        setVehicle(data);

        // Pre-populate form with vehicle data
        setFormData({
          categoryId: data.categoryId,
          makeId: data.makeId,
          modelId: data.modelId,
          title: data.title,
          description: data.description || '',
          price: data.price,
          currency: data.currency,
          year: data.year,
          mileage: data.mileage,
          mileageUnit: data.mileageUnit,
          transmission: data.transmission,
          fuelType: data.fuelType,
          bodyType: data.bodyType,
          engineCapacity: data.engineCapacity || undefined,
          color: data.color || undefined,
          registrationCity: data.registrationCity || undefined,
          registrationYear: data.registrationYear || undefined,
          city: data.city,
          province: data.province || '',
          address: data.address || undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [vehicleId, isAuthenticated, user?.id, router]);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCatalog((prev) => ({ ...prev, categories: true }));
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setLoadingCatalog((prev) => ({ ...prev, categories: false }));
      }
    }
    loadCategories();
  }, []);

  // Load makes when category changes
  useEffect(() => {
    const abortController = new AbortController();

    async function loadMakes() {
      if (!formData.categoryId) {
        setMakes([]);
        setModels([]);
        return;
      }

      try {
        setLoadingCatalog((prev) => ({ ...prev, makes: true }));
        const data = await getMakes(formData.categoryId);
        
        if (!abortController.signal.aborted) {
          setMakes(data);
          // If vehicle's makeId is not in the loaded makes, reset it
          if (vehicle && vehicle.makeId && !data.find(m => m.id === vehicle.makeId)) {
            setFormData((prev) => ({ ...prev, makeId: '', modelId: '' }));
            setModels([]);
          }
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Failed to load makes. Please try again.');
          setMakes([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingCatalog((prev) => ({ ...prev, makes: false }));
        }
      }
    }
    
    loadMakes();
    
    return () => {
      abortController.abort();
    };
  }, [formData.categoryId, vehicle]);

  // Load models when make changes
  useEffect(() => {
    const abortController = new AbortController();

    async function loadModels() {
      if (!formData.makeId) {
        setModels([]);
        return;
      }

      try {
        setLoadingCatalog((prev) => ({ ...prev, models: true }));
        const data = await getModels(formData.makeId);
        
        if (!abortController.signal.aborted) {
          setModels(data);
          // If vehicle's modelId is not in the loaded models, reset it
          if (vehicle && vehicle.modelId && !data.find(m => m.id === vehicle.modelId)) {
            setFormData((prev) => ({ ...prev, modelId: '' }));
          }
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Failed to load models. Please try again.');
          setModels([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingCatalog((prev) => ({ ...prev, models: false }));
        }
      }
    }
    
    loadModels();
    
    return () => {
      abortController.abort();
    };
  }, [formData.makeId, vehicle]);

  // Wait for auth to resolve first to avoid redirect/jitter on refresh
  if (authLoading) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="h-8 w-40 animate-pulse rounded-[20px] bg-white border border-[#e5e5e5]" />
          <div className="mt-4 h-96 animate-pulse rounded-[20px] bg-white border border-[#e5e5e5]" />
        </div>
      </div>
    );
  }

  // Not authenticated after loading → show CTA instead of redirect to prevent loops
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <h1 className="font-[var(--font-space-grotesk)] mb-2 text-4xl font-semibold">Edit Listing</h1>
          <p className="mb-6 text-[#666]">Please sign in to edit your listing.</p>
          <Link href={`/login?redirect=/vehicles/${vehicleId}/edit`}>
            <Button className="bg-[#111] text-white hover:bg-[#222]">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20 flex items-center justify-center">
        <p className="text-[#666]">Loading vehicle...</p>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="bg-white rounded-[20px] border border-red-200 bg-red-50 p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href={`/vehicles/${vehicleId}`}>
              <Button variant="outline" className="border-[#e5e5e5] hover:bg-[#fafafa]">Back to Vehicle</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'year' || name === 'mileage' || name === 'engineCapacity' || name === 'registrationYear'
        ? Number(value) || 0
        : value,
    }));
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const currentImageCount = (vehicle?.images?.length || 0) - imagesToDelete.length + newImages.length;
      if (currentImageCount + files.length > 10) {
        setError('Maximum 10 images allowed');
        return;
      }
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const handleRestoreImage = (imageId: string) => {
    setImagesToDelete((prev) => prev.filter(id => id !== imageId));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.categoryId || !formData.makeId || !formData.modelId) {
        setError('Please select category, make, and model.');
        setSaving(false);
        return;
      }

      const vehicle = await updateVehicle(
        vehicleId,
        {
          ...formData,
          // Include image IDs to delete if any
          imageIdsToDelete: imagesToDelete.length > 0 ? imagesToDelete : undefined,
        },
        newImages.length > 0 ? newImages : undefined,
      );
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  const existingImages = vehicle?.images?.filter(img => !imagesToDelete.includes(img.id)) || [];

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/vehicles/${vehicleId}`}>
            <Button variant="outline" className="mb-4 border-[#e5e5e5] hover:bg-[#fafafa]">← Back to Vehicle</Button>
          </Link>
          <h1 className="font-[var(--font-space-grotesk)] text-4xl font-semibold">Edit Vehicle Listing</h1>
          <p className="mt-2 text-[#666]">
            Update your vehicle listing details
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="status" aria-live="polite">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] font-semibold mb-6">Basic Information</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="mb-2 block text-sm font-medium text-[#666]">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., 2019 Toyota Corolla XLI"
                    required
                    minLength={10}
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your vehicle..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={4}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Price (PKR) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      required
                      min={0}
                    />
                  </div>

                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={formData.year || ''}
                      onChange={handleInputChange}
                      required
                      min={1900}
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="mileage">Mileage *</Label>
                    <Input
                      id="mileage"
                      name="mileage"
                      type="number"
                      value={formData.mileage || ''}
                      onChange={handleInputChange}
                      required
                      min={0}
                    />
                  </div>

                  <div>
                    <Label htmlFor="mileageUnit">Mileage Unit</Label>
                    <select
                      id="mileageUnit"
                      name="mileageUnit"
                      value={formData.mileageUnit}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="km">Kilometers</option>
                      <option value="mi">Miles</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] font-semibold mb-6">Specifications</h2>
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="transmission">Transmission *</Label>
                    <select
                      id="transmission"
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      {Object.values(TransmissionType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      {Object.values(FuelType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="bodyType">Body Type *</Label>
                    <select
                      id="bodyType"
                      name="bodyType"
                      value={formData.bodyType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      {Object.values(BodyType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="engineCapacity">Engine Capacity (CC)</Label>
                    <Input
                      id="engineCapacity"
                      name="engineCapacity"
                      type="number"
                      value={formData.engineCapacity || ''}
                      onChange={handleInputChange}
                      min={0}
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., White, Black"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
        {/* Sticky save bar for quick actions */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e5e5e5] bg-white/95 backdrop-blur px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
            <span className="text-xs text-[#666]">Review your updates, then save.</span>
            <div className="flex items-center gap-2">
              <Link href={`/vehicles/${vehicleId}`} className="text-sm text-[#666] hover:text-[#10b981] transition-colors">
                Cancel
              </Link>
              <Button
                type="button"
                className="bg-[#10b981] text-white hover:bg-[#059669]"
                onClick={() => {
                  const form = document.querySelector('form');
                  form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
