'use client';

/**
 * Create Vehicle Page
 * Form to create a new vehicle listing
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createVehicle } from '@/lib/vehicles-api';
import type { CreateVehicleData } from '@/types/vehicle';
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
          <h1 className="text-4xl font-bold text-foreground">List Your Vehicle</h1>
          <p className="mt-2 text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
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
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <p className="mt-2 text-sm text-muted-foreground">
                      {images.length} image(s) selected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category/Make/Model - Temporary Input */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-900 dark:text-yellow-200">
                  <p className="font-semibold mb-2">⚠️ Temporary: Direct ID Input</p>
                  <p>For now, you need to provide category, make, and model IDs from the database.</p>
                  <p className="mt-2">Run the seed script first: <code className="bg-background px-1 rounded">pnpm db:seed</code></p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="categoryId">Category ID *</Label>
                    <Input
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      placeholder="UUID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="makeId">Make ID *</Label>
                    <Input
                      id="makeId"
                      name="makeId"
                      value={formData.makeId}
                      onChange={handleInputChange}
                      placeholder="UUID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelId">Model ID *</Label>
                    <Input
                      id="modelId"
                      name="modelId"
                      value={formData.modelId}
                      onChange={handleInputChange}
                      placeholder="UUID"
                      required
                    />
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

