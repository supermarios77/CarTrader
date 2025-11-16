'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { getVehicle, updateVehicle } from '@/lib/vehicles-api';
import { getAllMakes, getModels, getCategories, type Make, type Model } from '@/lib/catalog-api';
import type { Vehicle } from '@/types/vehicle';
import { BodyType, FuelType, TransmissionType } from '@/types/vehicle';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const vehicleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  // Catalog
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const pendingModelByIdRef = useRef<string | null>(null);

  // Form
  const [categoryId, setCategoryId] = useState('');
  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState('PKR');
  const [year, setYear] = useState<string>('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [registrationCity, setRegistrationCity] = useState('');
  const [registrationYear, setRegistrationYear] = useState<string>('');
  const [engineCapacity, setEngineCapacity] = useState<string>('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState<string>('');
  const [mileageUnit] = useState('km');
  const [transmission, setTransmission] = useState<TransmissionType>(TransmissionType.MANUAL);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.PETROL);
  const [bodyType, setBodyType] = useState<BodyType>(BodyType.SEDAN);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const [imageIdsToDelete, setImageIdsToDelete] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const v = await getVehicle(vehicleId);
        setVehicle(v);
        setCategoryId(v.categoryId);
        setMakeId(v.makeId);
        setModelId(v.modelId);
        pendingModelByIdRef.current = v.modelId;
        setTitle(v.title);
        setDescription(v.description || '');
        setPrice(String(v.price));
        setCurrency(v.currency || 'PKR');
        setYear(String(v.year));
        setCity(v.city || '');
        setProvince(v.province || '');
        setAddress(v.address || '');
        setRegistrationCity(v.registrationCity || '');
        setRegistrationYear(v.registrationYear ? String(v.registrationYear) : '');
        setEngineCapacity(v.engineCapacity ? String(v.engineCapacity) : '');
        setColor(v.color || '');
        setMileage(String(v.mileage || ''));
        setTransmission(v.transmission);
        setFuelType(v.fuelType);
        setBodyType(v.bodyType);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    }
    if (vehicleId) load();
  }, [vehicleId]);

  // Load catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        setCatalogLoading(true);
        const [cats, mk] = await Promise.all([getCategories(), getAllMakes()]);
        setCategories(cats);
        setMakes(mk);
      } catch {
        // ignore minor catalog errors
      } finally {
        setCatalogLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Load models when make changes
  useEffect(() => {
    async function loadModels() {
      if (!makeId) {
        setModels([]);
        return;
      }
      try {
        const list = await getModels(makeId);
        setModels(list);
        const desired = pendingModelByIdRef.current;
        if (desired) {
          const found = list.find((m) => m.id === desired);
          if (found) setModelId(found.id);
          pendingModelByIdRef.current = null;
        }
      } catch {
        setModels([]);
      }
    }
    loadModels();
  }, [makeId]);

  const years = useMemo(() => {
    const max = new Date().getFullYear() + 1;
    const arr: number[] = [];
    for (let y = max; y >= 1990; y--) arr.push(y);
    return arr;
  }, []);

  const isOwner = vehicle && user && vehicle.userId === user.id;

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = [...imagesToUpload];
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith('image/')) return;
      if (f.size > 10 * 1024 * 1024) return;
      next.push(f);
    });
    setImagesToUpload(next.slice(0, 12));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateVehicle(
        vehicle.id,
        {
          categoryId,
          makeId,
          modelId,
          title: title.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          currency,
          year: Number(year),
          mileage: Number(mileage),
          mileageUnit,
          transmission,
          fuelType,
          bodyType,
          city: city.trim(),
          province: province.trim() || undefined,
          address: address.trim() || undefined,
          registrationCity: registrationCity.trim() || undefined,
          registrationYear: registrationYear ? Number(registrationYear) : undefined,
          engineCapacity: engineCapacity ? Number(engineCapacity) : undefined,
          color: color.trim() || undefined,
          imageIdsToDelete: imageIdsToDelete.length ? imageIdsToDelete : undefined,
        } as any,
        imagesToUpload,
      );
      router.replace(`/vehicles/${updated.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-white">
        <h1 className="mb-4 text-3xl font-black">Edit Listing</h1>
        <p className="mb-6 text-gray-400">Please sign in to edit your listing.</p>
        <a href="/login">
          <Button className="bg-white text-black hover:bg-gray-100">Sign In</Button>
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-white">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-96 animate-pulse rounded-xl border border-white/10 bg-white/5" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-white">
        <p className="mb-4 text-red-300">{error || 'Vehicle not found'}</p>
        <Link href="/vehicles">
          <Button variant="outline">Back to Listings</Button>
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-white">
        <h1 className="mb-2 text-3xl font-black">Edit Listing</h1>
        <p className="text-gray-400">You do not have permission to edit this listing.</p>
        <Link href={`/vehicles/${vehicle.id}`}>
          <Button className="mt-6" variant="outline">
            Back to Listing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-12">
        <div className="mb-4">
          <Link href={`/vehicles/${vehicle.id}`} className="text-sm text-gray-400 hover:text-white">
            ← Back to Listing
          </Link>
        </div>
        <h1 className="mb-2 text-3xl font-black">Edit Listing</h1>
        <p className="mb-6 text-gray-400">Update details, photos, and pricing.</p>

        {saveError && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-xl font-bold">Basic Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-300">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-gray-300">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Make</label>
                <select
                  value={makeId}
                  onChange={(e) => setMakeId(e.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3"
                >
                  {makes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Model</label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3">
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Price</label>
                <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Province</label>
                <Input value={province} onChange={(e) => setProvince(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-gray-300">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Registration City</label>
                <Input value={registrationCity} onChange={(e) => setRegistrationCity(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Registration Year</label>
                <select value={registrationYear} onChange={(e) => setRegistrationYear(e.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3">
                  <option value="">—</option>
                  {years.map((y) => (
                    <option key={`reg-${y}`} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-gray-300">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px] bg-black/30 text-white" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-xl font-bold">Specifications</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-gray-300">Mileage</label>
                <Input type="number" min="0" value={mileage} onChange={(e) => setMileage(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Engine Capacity (cc)</label>
                <Input type="number" min="0" value={engineCapacity} onChange={(e) => setEngineCapacity(e.target.value)} className="bg-black/30 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Transmission</label>
                <select value={transmission} onChange={(e) => setTransmission(e.target.value as TransmissionType)} className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3">
                  {Object.values(TransmissionType).map((t) => (
                    <option key={t} value={t}>
                      {t.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Fuel Type</label>
                <select value={fuelType} onChange={(e) => setFuelType(e.target.value as FuelType)} className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3">
                  {Object.values(FuelType).map((t) => (
                    <option key={t} value={t}>
                      {t.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Body Type</label>
                <select value={bodyType} onChange={(e) => setBodyType(e.target.value as BodyType)} className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-3">
                  {Object.values(BodyType).map((t) => (
                    <option key={t} value={t}>
                      {t.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Color</label>
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="bg-black/30 text-white" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-xl font-bold">Photos</h2>
            <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {vehicle.images.map((img) => {
                const marked = imageIdsToDelete.includes(img.id);
                return (
                  <div key={img.id} className={`relative overflow-hidden rounded-xl border ${marked ? 'border-red-500/40' : 'border-white/10'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || vehicle.title} className="h-36 w-full object-cover opacity-100" />
                    <button
                      type="button"
                      onClick={() =>
                        setImageIdsToDelete((prev) =>
                          prev.includes(img.id) ? prev.filter((id) => id !== img.id) : [...prev, img.id],
                        )
                      }
                      className={`absolute right-2 top-2 rounded-md px-2 py-1 text-xs ${
                        marked ? 'bg-red-600 text-white' : 'bg-black/70 text-white'
                      }`}
                    >
                      {marked ? 'Undo' : 'Remove'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <input id="images" type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
              <p className="mt-2 text-xs text-gray-400">Add more images (max 12, 10MB each).</p>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <Link href={`/vehicles/${vehicle.id}`} className="text-sm text-gray-400 hover:text-white">
              Cancel
            </Link>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const { user, isAuthenticated } = useAuth();
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-muted-foreground">Loading vehicle...</p>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
              <Link href={`/vehicles/${vehicleId}`}>
                <Button variant="outline" className="mt-4">Back to Vehicle</Button>
              </Link>
            </CardContent>
          </Card>
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/vehicles/${vehicleId}`}>
            <Button variant="ghost" className="mb-4">← Back to Vehicle</Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Edit Vehicle Listing</h1>
          <p className="mt-2 text-muted-foreground">
            Update your vehicle listing details
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {loadingCatalog.categories && (
                      <p className="mt-1 text-xs text-muted-foreground">Loading categories...</p>
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">{formData.categoryId ? 'Select Make' : 'Select Category First'}</option>
                      {makes.map((make) => (
                        <option key={make.id} value={make.id}>
                          {make.name}
                        </option>
                      ))}
                    </select>
                    {loadingCatalog.makes && (
                      <p className="mt-1 text-xs text-muted-foreground">Loading makes...</p>
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">{formData.makeId ? 'Select Model' : 'Select Make First'}</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    {loadingCatalog.models && (
                      <p className="mt-1 text-xs text-muted-foreground">Loading models...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <Label>Existing Images</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt={image.alt || vehicle?.title || 'Vehicle image'}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deleted Images (can restore) */}
                {imagesToDelete.length > 0 && (
                  <div>
                    <Label>Deleted Images (click to restore)</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {vehicle?.images
                        ?.filter(img => imagesToDelete.includes(img.id))
                        .map((image) => (
                          <div key={image.id} className="relative opacity-50">
                            <img
                              src={image.url}
                              alt={image.alt || vehicle?.title || 'Vehicle image'}
                              className="h-32 w-full rounded-lg object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute right-2 top-2"
                              onClick={() => handleRestoreImage(image.id)}
                            >
                              Restore
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {newImages.length > 0 && (
                  <div>
                    <Label>New Images</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New image ${index + 1}`}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => handleRemoveNewImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div>
                  <Label htmlFor="newImages">Add More Images (Max 10 total, 5MB each)</Label>
                  <Input
                    id="newImages"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleNewImageChange}
                    className="cursor-pointer"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {existingImages.length + newImages.length} / 10 images
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving} size="lg">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/vehicles/${vehicleId}`}>
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

