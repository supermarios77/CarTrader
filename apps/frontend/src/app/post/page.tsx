'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { getAllMakes, getModels, getCategories, type Make, type Model } from '@/lib/catalog-api';
import { createVehicle } from '@/lib/vehicles-api';
import { BodyType, FuelType, TransmissionType } from '@/types/vehicle';

type Step = 'details' | 'specs' | 'media' | 'review';

export default function SellVehiclePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Data
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [makesLoading, setMakesLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Form state
  const [categoryId, setCategoryId] = useState<string>('');
  const [makeId, setMakeId] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [currency] = useState('PKR');
  const [year, setYear] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [registrationCity, setRegistrationCity] = useState<string>('');
  const [registrationYear, setRegistrationYear] = useState<string>('');
  const [engineCapacity, setEngineCapacity] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [featureName, setFeatureName] = useState<string>('');
  const [featureValue, setFeatureValue] = useState<string>('');
  const [features, setFeatures] = useState<Array<{ name: string; value?: string }>>([]);
  const [mileage, setMileage] = useState<string>('');
  const [mileageUnit] = useState('km');
  const [transmission, setTransmission] = useState<TransmissionType>(TransmissionType.MANUAL);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.PETROL);
  const [bodyType, setBodyType] = useState<BodyType>(BodyType.SEDAN);
  const [images, setImages] = useState<File[]>([]);

  const makesAbortRef = useRef<AbortController | null>(null);
  const modelsAbortRef = useRef<AbortController | null>(null);
  const pendingModelByNameRef = useRef<string | null>(null);

  // Load makes once
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset state when logged out; avoid fetching
      setMakes([]);
      setModels([]);
      setCategories([]);
      setMakesLoading(false);
      setModelsLoading(false);
      setCategoriesLoading(false);
      return;
    }
    setMakesLoading(true);
    setCategoriesLoading(true);
    setCatalogError(null);
    makesAbortRef.current?.abort();
    const ac = new AbortController();
    makesAbortRef.current = ac;
    Promise.all([getAllMakes(), getCategories()])
      .then((list) => {
        if (ac.signal.aborted) return;
        const [makesList, categoriesList] = list as unknown as [Make[], Array<{ id: string; name: string }>];
        setMakes(makesList);
        setCategories(categoriesList);
        // Preselect a likely car category if found
        const defaultCat =
          categoriesList.find((c) => c.name.toLowerCase().includes('car'))?.id ||
          categoriesList[0]?.id ||
          '';
        setCategoryId(defaultCat);
      })
      .catch((e) => {
        if (!ac.signal.aborted)
          setCatalogError(e instanceof Error ? e.message : 'Failed to load catalog');
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setMakesLoading(false);
          setCategoriesLoading(false);
        }
      });
    return () => ac.abort();
  }, [isAuthenticated]);

  // Load models when make changes
  useEffect(() => {
    setModels([]);
    setModelId('');
    if (!isAuthenticated || !makeId) return;
    setModelsLoading(true);
    setCatalogError(null);
    modelsAbortRef.current?.abort();
    const ac = new AbortController();
    modelsAbortRef.current = ac;
    getModels(makeId)
      .then((list) => {
        if (!ac.signal.aborted) {
          setModels(list);
          // If we requested a model by name (from mock fill), select it when available
          const desired = pendingModelByNameRef.current;
          if (desired && !modelId) {
            const found = list.find((m) =>
              m.name.toLowerCase().includes(desired.toLowerCase()),
            );
            if (found) {
              setModelId(found.id);
              pendingModelByNameRef.current = null;
            }
          }
        }
      })
      .catch((e) => {
        if (!ac.signal.aborted) setCatalogError(e instanceof Error ? e.message : 'Failed to load models');
      })
      .finally(() => {
        if (!ac.signal.aborted) setModelsLoading(false);
      });
    return () => ac.abort();
  }, [makeId]);

  const canContinueDetails =
    title.trim().length >= 6 &&
    categoryId &&
    makeId &&
    modelId &&
    year &&
    Number(year) >= 1990 &&
    Number(year) <= new Date().getFullYear() + 1 &&
    price &&
    Number(price) > 0 &&
    city.trim().length >= 2;

  const canSubmit =
    canContinueDetails &&
    mileage &&
    Number(mileage) >= 0 &&
    images.length > 0;

  function addFeature() {
    const name = featureName.trim();
    const value = featureValue.trim();
    if (!name) return;
    setFeatures((prev) => {
      const exists = prev.some((f) => f.name.toLowerCase() === name.toLowerCase());
      if (exists) return prev;
      return [...prev, value ? { name, value } : { name }];
    });
    setFeatureName('');
    setFeatureValue('');
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = [...images];
    Array.from(files).forEach((f) => {
      // 10 MB limit per file, image only
      if (!f.type.startsWith('image/')) return;
      if (f.size > 10 * 1024 * 1024) return;
      next.push(f);
    });
    setImages(next.slice(0, 12)); // cap at 12
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const vehicle = await createVehicle(
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
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          // Do not include features when empty to avoid backend coercion issues
          ...(features.length > 0 ? { features } : {}),
        } as any,
        images,
      );
      router.replace(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create vehicle');
    } finally {
      setSubmitting(false);
    }
  }

  const years = useMemo(() => {
    const max = new Date().getFullYear() + 1;
    const arr: number[] = [];
    for (let y = max; y >= 1990; y--) arr.push(y);
    return arr;
  }, []);

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        <h1 className="font-[var(--font-space-grotesk)] mb-2 text-4xl font-semibold">Sell Your Car</h1>
        <p className="mb-8 text-[#666]">Create a beautiful listing in a few simple steps.</p>

        {!isAuthenticated ? (
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <p className="mb-6 text-[#666]">Please sign in to list your vehicle.</p>
            <Link href="/login">
              <Button className="bg-[#111] text-white hover:bg-[#222]">Sign In</Button>
            </Link>
          </div>
        ) : (
          <>

        {/* Stepper */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          {(['details', 'specs', 'media', 'review'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`rounded-full border px-4 py-2.5 text-center text-sm font-medium transition-all ${
                step === s
                  ? 'border-[#10b981] bg-[#10b981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                  : 'border-[#e5e5e5] bg-white text-[#666]'
              }`}
            >
              {i + 1}. {s[0].toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <div className="mb-6">
            <Button
              type="button"
              onClick={() => {
                const cat =
                  categories.find((c) => c.name.toLowerCase().includes('car'))?.id ||
                  categories[0]?.id ||
                  '';
                setCategoryId(cat || categoryId);
                setTitle('2021 Suzuki Alto VXR 660cc Manual');
                setDescription(
                  'Brand new condition Suzuki Alto VXR. Low mileage, perfect for city driving. Excellent fuel economy. All features working. Single owner, garage kept. No accidents, original paint. Service book available.',
                );
                setPrice('1850000');
                setYear('2021');
                setCity('Islamabad');
                setProvince('Islamabad Capital Territory');
                setAddress('F-7 Markaz');
                setRegistrationCity('Islamabad');
                setRegistrationYear('2021');
                setMileage('25000');
                setTransmission(TransmissionType.MANUAL);
                setFuelType(FuelType.PETROL);
                setBodyType(BodyType.HATCHBACK);
                setEngineCapacity('660');
                setColor('Silver');
                const suzuki = makes.find((m) => m.name.toLowerCase().includes('suzuki'));
                if (suzuki) {
                  setMakeId(suzuki.id);
                  pendingModelByNameRef.current = 'Alto';
                }
                setFeatures([
                  { name: 'Power Steering' },
                  { name: 'Air Conditioning' },
                  { name: 'ABS' },
                ]);
              }}
              variant="outline"
              className="border-[#e5e5e5] hover:bg-[#fafafa]"
            >
              Fill with mock data (dev only)
            </Button>
          </div>
        )}

        {catalogError && (
          <div className="mb-6 rounded-[20px] border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
            {catalogError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Details */}
          {step === 'details' && (
            <section className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] mb-6 text-xl font-semibold">Basic Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all disabled:opacity-60"
                    disabled={categoriesLoading}
                  >
                    <option value="">{categoriesLoading ? 'Loading…' : 'Select category'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#666]">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 2018 Toyota Corolla Altis Grande"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Make</label>
                  <select
                    value={makeId}
                    onChange={(e) => setMakeId(e.target.value)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
                  >
                    <option value="">{makesLoading ? 'Loading…' : 'Select make'}</option>
                    {makes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Model</label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all disabled:opacity-60"
                    disabled={!makeId || modelsLoading}
                  >
                    <option value="">{modelsLoading ? 'Loading…' : 'Select model'}</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
                  >
                    <option value="">Select year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Price</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 2750000"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">City</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Karachi"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Province</label>
                  <Input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="e.g., Sindh"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#666]">Address</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, area, optional"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Registration City</label>
                  <Input
                    value={registrationCity}
                    onChange={(e) => setRegistrationCity(e.target.value)}
                    placeholder="e.g., Lahore"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Registration Year</label>
                  <select
                    value={registrationYear}
                    onChange={(e) => setRegistrationYear(e.target.value)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
                  >
                    <option value="">—</option>
                    {years.map((y) => (
                      <option key={`reg-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#666]">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Condition, ownership, variants, notable features, and extras…"
                    className="min-h-[120px] rounded-[20px] border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    maxLength={1200}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setStep('specs')}
                  disabled={!canContinueDetails}
                  className="bg-[#111] text-white hover:bg-[#222] px-8"
                >
                  Continue
                </Button>
              </div>
            </section>
          )}

          {/* Specifications */}
          {step === 'specs' && (
            <section className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] mb-6 text-xl font-semibold">Specifications</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Mileage</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="e.g., 45000"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Engine Capacity (cc)</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={engineCapacity}
                    onChange={(e) => setEngineCapacity(e.target.value)}
                    placeholder="e.g., 1800"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
                  >
                    {Object.values(TransmissionType).map((t) => (
                      <option key={t} value={t}>
                        {t.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
                  >
                    {Object.values(FuelType).map((t) => (
                      <option key={t} value={t}>
                        {t.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Body Type</label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value as BodyType)}
                    className="h-12 w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
                  >
                    {Object.values(BodyType).map((t) => (
                      <option key={t} value={t}>
                        {t.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Color</label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g., White"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Latitude (optional)</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g., 24.8607"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#666]">Longitude (optional)</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g., 67.0011"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-[#666]">Features</h3>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    placeholder="Feature name (e.g., sunroof)"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                  <Input
                    value={featureValue}
                    onChange={(e) => setFeatureValue(e.target.value)}
                    placeholder="Optional value (e.g., panoramic)"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    className="bg-[#10b981] text-white hover:bg-[#059669] h-12 px-6"
                  >
                    Add
                  </Button>
                </div>
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {features.map((f, i) => (
                      <span
                        key={`${f.name}-${i}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#10b981]"
                      >
                        {f.name}
                        {f.value ? `: ${f.value}` : ''}
                        <button
                          type="button"
                          onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))}
                          className="ml-1 rounded-full bg-[#10b981]/20 p-0.5 text-[#10b981] hover:bg-[#10b981]/30 transition-colors"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#e5e5e5] hover:bg-[#fafafa]"
                  onClick={() => setStep('details')}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setStep('media')} className="bg-[#111] text-white hover:bg-[#222] px-8">
                  Continue
                </Button>
              </div>
            </section>
          )}

          {/* Media */}
          {step === 'media' && (
            <section className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] mb-6 text-xl font-semibold">Photos</h2>
              <div className="mb-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="text-sm"
                />
                <p className="mt-2 text-xs text-[#666]">Up to 12 images, 10MB each. JPG/PNG preferred.</p>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {images.map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className="group relative overflow-hidden rounded-xl border border-[#e5e5e5] bg-[#fafafa]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={file.name}
                          className="h-36 w-full object-cover"
                          onLoad={() => URL.revokeObjectURL(url)}
                        />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-90 hover:bg-red-600 transition-colors"
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#e5e5e5] hover:bg-[#fafafa]"
                  onClick={() => setStep('specs')}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setStep('review')} className="bg-[#111] text-white hover:bg-[#222] px-8">
                  Continue
                </Button>
              </div>
            </section>
          )}

          {/* Review & Publish */}
          {step === 'review' && (
            <section className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] mb-6 text-xl font-semibold">Review & Publish</h2>
              <ul className="mb-4 grid gap-3 text-sm md:grid-cols-2">
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Title:</strong>
                  <span className="text-right">{title || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Make:</strong>
                  <span>{makes.find((m) => m.id === makeId)?.name || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Model:</strong>
                  <span>{models.find((m) => m.id === modelId)?.name || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Year:</strong>
                  <span>{year || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Price:</strong>
                  <span className="font-semibold text-[#10b981]">
                    {currency} {price ? Number(price).toLocaleString() : '—'}
                  </span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">City:</strong>
                  <span>{city || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Province:</strong>
                  <span>{province || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Address:</strong>
                  <span className="text-right">{address || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Reg. City:</strong>
                  <span>{registrationCity || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Reg. Year:</strong>
                  <span>{registrationYear || '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Mileage:</strong>
                  <span>{mileage ? `${mileage} ${mileageUnit}` : '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Transmission:</strong>
                  <span className="capitalize">{transmission.toLowerCase()}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Fuel:</strong>
                  <span className="capitalize">{fuelType.toLowerCase()}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Body:</strong>
                  <span className="capitalize">{bodyType.toLowerCase()}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Engine:</strong>
                  <span>{engineCapacity ? `${engineCapacity} cc` : '—'}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-[#e5e5e5]">
                  <strong className="text-[#666]">Color:</strong>
                  <span className="capitalize">{color || '—'}</span>
                </li>
                <li className="flex justify-between py-2">
                  <strong className="text-[#666]">Lat/Lng:</strong>
                  <span>{latitude && longitude ? `${latitude}, ${longitude}` : '—'}</span>
                </li>
              </ul>
              {features.length > 0 && (
                <div className="mb-4">
                  <strong className="text-sm text-[#666]">Features:</strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {features.map((f, i) => (
                      <span
                        key={`${f.name}-${i}`}
                        className="rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1 text-xs font-medium text-[#10b981]"
                      >
                        {f.name}
                        {f.value ? `: ${f.value}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {submitError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#e5e5e5] hover:bg-[#fafafa]"
                  onClick={() => setStep('media')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="bg-[#10b981] text-white hover:bg-[#059669] px-8"
                >
                  {submitting ? 'Publishing…' : 'Publish Listing'}
                </Button>
              </div>
            </section>
          )}
        </form>
          </>
        )}
      </div>
    </div>
  );
}


