'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getVehicles } from '@/lib/vehicles-api';
import { getMakeById } from '@/lib/catalog-api';
import type { Vehicle, VehicleListResponse } from '@/types/vehicle';
import { Search, Grid3x3, List, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Filters = {
  search?: string;
  city?: string;
  makeId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'views';
  sortOrder?: 'asc' | 'desc';
};

const CITIES: string[] = [
  'All Cities',
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Quetta',
  'Faisalabad',
  'Multan',
  'Sialkot',
];

const PRICE_RANGES = [
  { label: 'Any Price' },
  { label: 'Up to PKR 1,000,000', max: 1_000_000 },
  { label: 'PKR 1,000,000 - 2,000,000', min: 1_000_000, max: 2_000_000 },
  { label: 'PKR 2,000,000 - 3,500,000', min: 2_000_000, max: 3_500_000 },
  { label: 'PKR 3,500,000 - 5,000,000', min: 3_500_000, max: 5_000_000 },
  { label: 'PKR 5,000,000 - 7,500,000', min: 5_000_000, max: 7_500_000 },
  { label: 'PKR 7,500,000 - 10,000,000', min: 7_500_000, max: 10_000_000 },
  { label: 'Above PKR 10,000,000', min: 10_000_000 },
];

export default function VehiclesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<VehicleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local UI state mirrors query params
  const [query, setQuery] = useState<string>(searchParams.get('search') || '');
  const [makeId, setMakeId] = useState<string | null>(searchParams.get('makeId'));
  const [city, setCity] = useState<string>(searchParams.get('city') || CITIES[0]);
  const [priceKey, setPriceKey] = useState<string>(() => {
    const min = searchParams.get('minPrice');
    const max = searchParams.get('maxPrice');
    const match = PRICE_RANGES.find(
      (r) =>
        String(r.min ?? '') === String(min ?? '') && String(r.max ?? '') === String(max ?? ''),
    );
    return match?.label || PRICE_RANGES[0].label;
  });
  const [page, setPage] = useState<number>(Number(searchParams.get('page') || '1'));
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'latest');
  const [limit, setLimit] = useState<number>(Number(searchParams.get('limit') || '12'));
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [makeName, setMakeName] = useState<string | null>(null);

  const selectedRange = useMemo(
    () => PRICE_RANGES.find((r) => r.label === priceKey) || PRICE_RANGES[0],
    [priceKey],
  );

  function toFilters(): Filters {
    const f: Filters = { page, limit };
    if (query.trim()) f.search = query.trim();
    if (makeId) f.makeId = makeId;
    if (city && city !== 'All Cities') f.city = city;
    if (selectedRange.min !== undefined) f.minPrice = selectedRange.min;
    if (selectedRange.max !== undefined) f.maxPrice = selectedRange.max;
    // map sort -> sortBy/sortOrder
    switch (sort) {
      case 'priceAsc':
        f.sortBy = 'price';
        f.sortOrder = 'asc';
        break;
      case 'priceDesc':
        f.sortBy = 'price';
        f.sortOrder = 'desc';
        break;
      case 'yearAsc':
        f.sortBy = 'year';
        f.sortOrder = 'asc';
        break;
      case 'yearDesc':
        f.sortBy = 'year';
        f.sortOrder = 'desc';
        break;
      case 'latest':
      default:
        f.sortBy = 'createdAt';
        f.sortOrder = 'desc';
        break;
    }
    return f;
  }

  function pushUrl(f: Filters) {
    const params = new URLSearchParams();
    if (f.search) params.set('search', f.search);
    if (f.makeId) params.set('makeId', f.makeId);
    if (f.city) params.set('city', f.city);
    if (f.minPrice !== undefined) params.set('minPrice', String(f.minPrice));
    if (f.maxPrice !== undefined) params.set('maxPrice', String(f.maxPrice));
    if (f.page && f.page > 1) params.set('page', String(f.page));
    if (limit && limit !== 12) params.set('limit', String(limit));
    if (sort && sort !== 'latest') params.set('sort', sort);
    const qs = params.toString();
    router.replace(`/vehicles${qs ? `?${qs}` : ''}`);
  }

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const filters = toFilters();
      pushUrl(filters);
      const resp = await getVehicles(filters as any);
      setData(resp);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load vehicles');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceKey, city, page, sort, limit]);

  // Fetch brand name for chip display when makeId is present
  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();
    async function fetchMake() {
      if (!makeId) {
        setMakeName(null);
        return;
      }
      try {
        const make = await getMakeById(makeId);
        if (!aborted) setMakeName(make?.name || null);
      } catch {
        if (!aborted) setMakeName(null);
      }
    }
    fetchMake();
    return () => {
      aborted = true;
      controller.abort();
    };
  }, [makeId]);

  // If the user types, we won't fetch until they hit Search
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  const totalPages = data?.pagination?.totalPages || 1;
  const totalResults = data?.pagination?.total || 0;
  const hasActiveFilters =
    (query && query.trim().length > 0) ||
    Boolean(makeId) ||
    (city && city !== 'All Cities') ||
    (PRICE_RANGES.find((r) => r.label === priceKey) !== PRICE_RANGES[0]) ||
    (sort && sort !== 'latest');

  function clearFilters() {
    setQuery('');
    setMakeId(null);
    setCity(CITIES[0]);
    setPriceKey(PRICE_RANGES[0].label);
    setSort('latest');
    setPage(1);
    setLimit(12);
    load();
  }

  const formatPrice = (price: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-[var(--font-space-grotesk)] text-4xl font-semibold mb-2">Browse Vehicles</h1>
            <p className="text-[#666]">
              {loading
                ? 'Loading…'
                : `${totalResults} listing${(totalResults || 0) === 1 ? '' : 's'} available`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                view === 'grid'
                  ? 'bg-[#111] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                  : 'bg-white border border-[#e5e5e5] text-[#444] hover:border-black'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-[#111] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                  : 'bg-white border border-[#e5e5e5] text-[#444] hover:border-black'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="mb-8 rounded-[20px] border border-[#e5e5e5] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
                <input
                  id="q"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search make or model"
                  className="w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-12 py-3 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
                  autoComplete="off"
                  maxLength={80}
                />
              </div>
            </div>
            <div>
              <select
                id="city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all appearance-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c === 'All Cities' ? '' : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="price"
                value={priceKey}
                onChange={(e) => {
                  setPriceKey(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all appearance-none"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.label} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all appearance-none"
              >
                <option value="latest">Latest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="yearDesc">Year: New to Old</option>
                <option value="yearAsc">Year: Old to New</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {makeId && (
                <button
                  type="button"
                  onClick={() => {
                    setMakeId(null);
                    setPage(1);
                    load();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#10b981] hover:bg-[#dcfce7] transition-colors"
                >
                  {makeName || 'Brand'}
                  <X className="w-3 h-3" />
                </button>
              )}
              {query.trim() && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#10b981]">
                  {query}
                </span>
              )}
              {city && city !== 'All Cities' && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#10b981]">
                  {city}
                </span>
              )}
              {(PRICE_RANGES.find((r) => r.label === priceKey) !== PRICE_RANGES[0]) && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#10b981]">
                  {priceKey}
                </span>
              )}
              {sort !== 'latest' && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#10b981]">
                  {sort}
                </span>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-sm font-medium text-[#666] hover:text-black transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </form>

        {/* Results */}
        {error && (
          <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className={`${view === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`${view === 'grid' ? 'h-80' : 'h-32'} animate-pulse rounded-[20px] bg-white border border-[#e5e5e5]`}
              />
            ))}
          </div>
        ) : data && data.vehicles.length > 0 ? (
          <>
            {view === 'grid' ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.vehicles.map((v: Vehicle) => (
                  <Link
                    key={v.id}
                    href={`/vehicles/${v.id}`}
                    className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
                  >
                    <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] relative">
                      {v.images?.[0]?.url ? (
                        <Image
                          src={v.images[0].url}
                          alt={v.title}
                          width={300}
                          height={240}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                          <span className="text-white text-4xl">🚗</span>
                        </div>
                      )}
                      {v.featured && (
                        <div className="absolute top-3 left-3 bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-[#10b981]">
                        {formatPrice(Number(v.price), v.currency)}
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-base block mb-1">{v.title}</span>
                        <span className="text-xs text-[#888]">
                          {v.year} • {v.mileage?.toLocaleString()} km
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data.vehicles.map((v: Vehicle) => (
                  <Link
                    key={v.id}
                    href={`/vehicles/${v.id}`}
                    className="group flex gap-4 bg-white rounded-[20px] p-6 border border-[#e5e5e5] transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-[#10b981]/20"
                  >
                    <div className="relative w-40 h-32 rounded-xl overflow-hidden bg-[#f5f5f5] shrink-0">
                      {v.images?.[0]?.url ? (
                        <Image
                          src={v.images[0].url}
                          alt={v.title}
                          width={160}
                          height={128}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                          <span className="text-white text-3xl">🚗</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-semibold line-clamp-1">{v.title}</h3>
                        <div className="text-lg font-bold text-[#10b981] shrink-0">
                          {formatPrice(Number(v.price), v.currency)}
                        </div>
                      </div>
                      <p className="text-sm text-[#666] mb-3">
                        {v.make?.name} {v.model?.name} • {v.year} • {v.mileage?.toLocaleString()} km • {v.city}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-xs text-[#666]">
                          {v.transmission.toLowerCase()}
                        </span>
                        <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-xs text-[#666]">
                          {v.fuelType.toLowerCase()}
                        </span>
                        <span className="rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-xs text-[#666]">
                          {v.bodyType.toLowerCase()}
                        </span>
                        {v.featured && (
                          <span className="rounded-full border border-[#10b981] bg-[#f0fdf4] px-3 py-1 text-xs text-[#10b981] font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#666]">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-[#666]">
              Showing {Math.min((page - 1) * limit + 1, totalResults)}–
              {Math.min(page * limit, totalResults)} of {totalResults} vehicles
            </div>
          </>
        ) : (
          <div className="rounded-[20px] border border-[#e5e5e5] bg-white p-12 text-center">
            <p className="text-[#666] mb-4">No vehicles found. Adjust filters and try again.</p>
            <Button onClick={clearFilters} className="bg-[#111] text-white hover:bg-[#222]">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
