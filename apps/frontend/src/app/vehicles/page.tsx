'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getVehicles } from '@/lib/vehicles-api';
import type { Vehicle, VehicleListResponse } from '@/types/vehicle';
import { LandingListings } from '@/components/site/landing/listings';

type Filters = {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
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

  const selectedRange = useMemo(
    () => PRICE_RANGES.find((r) => r.label === priceKey) || PRICE_RANGES[0],
    [priceKey],
  );

  function toFilters(): Filters {
    const f: Filters = { page, limit: 12 };
    if (query.trim()) f.search = query.trim();
    if (city && city !== 'All Cities') f.city = city;
    if (selectedRange.min !== undefined) f.minPrice = selectedRange.min;
    if (selectedRange.max !== undefined) f.maxPrice = selectedRange.max;
    return f;
  }

  function pushUrl(f: Filters) {
    const params = new URLSearchParams();
    if (f.search) params.set('search', f.search);
    if (f.city) params.set('city', f.city);
    if (f.minPrice !== undefined) params.set('minPrice', String(f.minPrice));
    if (f.maxPrice !== undefined) params.set('maxPrice', String(f.maxPrice));
    if (f.page && f.page > 1) params.set('page', String(f.page));
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
  }, [priceKey, city, page, sort]);

  // If the user types, we won't fetch until they hit Search
  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setPage(1);
    load();
  }

  const totalPages = data?.pagination?.totalPages || 1;
  const totalResults = data?.pagination?.total || 0;
  const hasActiveFilters =
    (query && query.trim().length > 0) ||
    (city && city !== 'All Cities') ||
    (PRICE_RANGES.find((r) => r.label === priceKey) !== PRICE_RANGES[0]) ||
    (sort && sort !== 'latest');

  function clearFilters() {
    setQuery('');
    setCity(CITIES[0]);
    setPriceKey(PRICE_RANGES[0].label);
    setSort('latest');
    setPage(1);
    load();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-12">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-2xl font-black md:text-3xl">Browse Vehicles</h1>
            <div className="text-sm text-gray-400">
              {loading ? 'Loading…' : `${totalResults} listing${(totalResults || 0) === 1 ? '' : 's'}`}
            </div>
          </div>
          <form
            onSubmit={handleSearch}
            className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur"
          >
            <div className="grid gap-2 md:grid-cols-5">
              <div className="md:col-span-2">
                <label htmlFor="q" className="sr-only">
                  Make or Model
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-400" aria-hidden>
                    <path d="M10 4a6 6 0 0 1 4.472 9.995l4.266 4.267a1 1 0 0 1-1.415 1.415l-4.267-4.266A6 6 0 1 1 10 4m0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8" />
                  </svg>
                  <input
                    id="q"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search make or model (e.g., Corolla, Civic, Cultus)"
                    className="w-full bg-transparent text-white placeholder:text-gray-500 outline-none"
                    autoComplete="off"
                    maxLength={80}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="city" className="sr-only">
                  City
                </label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left font-medium text-white outline-none transition-all focus:border-emerald-500/50"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c === 'All Cities' ? '' : c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="price" className="sr-only">
                  Price Range
                </label>
                <select
                  id="price"
                  value={priceKey}
                  onChange={(e) => {
                    setPriceKey(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left font-medium text-white outline-none transition-all focus:border-emerald-500/50"
                >
                  {PRICE_RANGES.map((r) => (
                    <option key={r.label} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="sr-only">
                  Sort
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left font-medium text-white outline-none transition-all focus:border-emerald-500/50"
                >
                  <option value="latest">Latest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="yearDesc">Year: New to Old</option>
                  <option value="yearAsc">Year: Old to New</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {hasActiveFilters && (
                  <>
                    {query.trim() && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        {query}
                      </span>
                    )}
                    {city && city !== 'All Cities' && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        {city}
                      </span>
                    )}
                    {(PRICE_RANGES.find((r) => r.label === priceKey) !== PRICE_RANGES[0]) && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        {priceKey}
                      </span>
                    )}
                    {sort !== 'latest' && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        {sort}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 px-6 py-2.5 font-semibold text-white hover:opacity-90"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-12">
        {error && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : data && data.vehicles.length > 0 ? (
          <LandingListings
            cars={data.vehicles.map((v: Vehicle) => ({
              id: Number.isNaN(Number(v.id)) ? iHash(v.id) : (Number(v.id) as number),
              name: v.title,
              price: `${v.currency} ${Number(v.price).toLocaleString()}`,
              year: String(v.year),
              mileage: v.mileage ? `${v.mileage.toLocaleString()} km` : '—',
              image: v.images?.[0]?.url || '/placeholder.svg',
              featured: Boolean(v.featured),
            }))}
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-gray-400">
            No vehicles found. Adjust filters and try again.
          </div>
        )}

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-300">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function iHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

