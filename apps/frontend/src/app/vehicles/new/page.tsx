'use client';

/**
 * Create Vehicle Page
 * Form to create a new vehicle listing
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createVehicle } from '@/lib/vehicles-api';
import type { CreateVehicleData } from '@/types/vehicle';
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

export default function CreateVehiclePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);

  // Catalog data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState({
    categories: true,
    makes: false,
    models: false,
  });

  const [formData, setFormData] = useState<CreateVehicleData>({
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
        setFormData((prev) => ({ ...prev, makeId: '', modelId: '' }));
        return;
      }

      try {
        setLoadingCatalog((prev) => ({ ...prev, makes: true }));
        const data = await getMakes(formData.categoryId);
        
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setMakes(data);
          // Reset make and model when category changes
          setModels([]);
          setFormData((prev) => ({ ...prev, makeId: '', modelId: '' }));
        }
      } catch (err) {
        // Don't set error if request was aborted
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
    
    // Cleanup: abort request if category changes or component unmounts
    return () => {
      abortController.abort();
    };
  }, [formData.categoryId]);

  // Load models when make changes
  useEffect(() => {
    const abortController = new AbortController();

    async function loadModels() {
      if (!formData.makeId) {
        setModels([]);
        setFormData((prev) => ({ ...prev, modelId: '' }));
        return;
      }

      try {
        setLoadingCatalog((prev) => ({ ...prev, models: true }));
        const data = await getModels(formData.makeId);
        
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setModels(data);
          // Reset model when make changes
          setFormData((prev) => ({ ...prev, modelId: '' }));
        }
      } catch (err) {
        // Don't set error if request was aborted
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
    
    // Cleanup: abort request if make changes or component unmounts
    return () => {
      abortController.abort();
    };
  }, [formData.makeId]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'year' || name === 'mileage' || name === 'engineCapacity'
        ? Number(value) || 0
        : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 10) {
        setError('Maximum 10 images allowed');
        return;
      }
      setImages(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Note: For now, we need valid category/make/model IDs
      // In production, you'd fetch these from API or have a selection UI
      if (!formData.categoryId || !formData.makeId || !formData.modelId) {
        setError('Please select category, make, and model. (Note: These need to be seeded in the database first)');
        setLoading(false);
        return;
      }

      const vehicle = await createVehicle(formData, images.length > 0 ? images : undefined);
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/vehicles">
            <Button variant="ghost" className="mb-4">← Back to Listings</Button>
          </Link>
          <h1 className="text-4xl font-bold text-[#111]">List Your Vehicle</h1>
          <p className="mt-2 text-[#666]">
            Fill in the details below to create your vehicle listing
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] font-semibold mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block text-sm font-medium text-[#666]">Title *</Label>
                  <Input
                    id="title"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., 2019 Toyota Corolla XLI"
                    required
                    minLength={10}
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
                    className="w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#111] placeholder:text-[#888] focus-visible:outline-none focus-visible:border-[#10b981] focus-visible:ring-2 focus-visible:ring-[rgba(16,185,129,0.1)]"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="grid gap-4 sm:grid-cols-2">
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
              </CardContent>
            </Card>

            {/* Vehicle Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
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

                <div className="grid gap-4 sm:grid-cols-2">
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
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Karachi"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    name="province"
                    value={formData.province || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Sindh"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    placeholder="Street address (optional)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="images">Upload Images (Max 10, 5MB each)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {images.length > 0 && (
                    <p className="mt-2 text-sm text-[#666]">
                      {images.length} image(s) selected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category/Make/Model - Dropdown Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Category Dropdown */}
                  <div>
                    <Label htmlFor="categoryId">Category *</Label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      disabled={loadingCatalog.categories}
                      className="flex h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#111] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888] focus-visible:outline-none focus-visible:border-[#10b981] focus-visible:ring-2 focus-visible:ring-[rgba(16,185,129,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {loadingCatalog.categories && (
                      <p className="mt-1 text-xs text-[#666]">Loading categories...</p>
                    )}
                  </div>

                  {/* Make Dropdown */}
                  <div>
                    <Label htmlFor="makeId">Make *</Label>
                    <select
                      id="makeId"
                      name="makeId"
                      value={formData.makeId}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.categoryId || loadingCatalog.makes}
                      className="flex h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#111] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888] focus-visible:outline-none focus-visible:border-[#10b981] focus-visible:ring-2 focus-visible:ring-[rgba(16,185,129,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">{formData.categoryId ? 'Select Make' : 'Select Category First'}</option>
                      {makes.map((make) => (
                        <option key={make.id} value={make.id}>
                          {make.name}
                        </option>
                      ))}
                    </select>
                    {loadingCatalog.makes && (
                      <p className="mt-1 text-xs text-[#666]">Loading makes...</p>
                    )}
                  </div>

                  {/* Model Dropdown */}
                  <div>
                    <Label htmlFor="modelId">Model *</Label>
                    <select
                      id="modelId"
                      name="modelId"
                      value={formData.modelId}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.makeId || loadingCatalog.models}
                      className="flex h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#111] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888] focus-visible:outline-none focus-visible:border-[#10b981] focus-visible:ring-2 focus-visible:ring-[rgba(16,185,129,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">{formData.makeId ? 'Select Model' : 'Select Make First'}</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    {loadingCatalog.models && (
                      <p className="mt-1 text-xs text-[#666]">Loading models...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
              <Link href="/vehicles">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

