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
  sort?: string;
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
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'newest');
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

  const selectedRange = useMemo(
    () => PRICE_RANGES.find((r) => r.label === priceKey) || PRICE_RANGES[0],
    [priceKey],
  );

  function toFilters(): Filters {
    const f: Filters = { page, limit: 12, sort };
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
    if (f.sort) params.set('sort', f.sort);
    if (f.page && f.page > 1) params.set('page', String(f.page));
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
  }, [priceKey, city, sort, page]);

  // If the user types, we won't fetch until they hit Search
  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setPage(1);
    load();
  }

  function clearFilters() {
    setQuery('');
    setCity(CITIES[0]);
    setPriceKey(PRICE_RANGES[0].label);
    setSort('newest');
    setPage(1);
    router.replace('/vehicles');
  }

  const totalPages = data?.pagination?.totalPages || 1;
  const total = data?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-2xl font-black">
              Browse Vehicles{total ? <span className="ml-2 text-sm font-medium text-gray-400">({total.toLocaleString()} results)</span> : null}
            </h1>
            <div className="hidden items-center gap-2 md:flex">
              <label htmlFor="sort" className="text-sm text-gray-400">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="year_new">Year: Newest</option>
                <option value="year_old">Year: Oldest</option>
              </select>
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={clearFilters}
              >
                Reset
              </Button>
            </div>
          </div>
          <form
            onSubmit={handleSearch}
            className="rounded-xl border border-white/10 bg-white/5 p-3 md:p-4"
          >
            <div className="grid gap-3 md:grid-cols-4">
              <div className="text-left md:col-span-2">
                <label htmlFor="q" className="sr-only">
                  Make or Model
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔎</span>
                  <input
                    id="q"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search make or model (e.g., Honda Civic)"
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-3 font-medium text-white placeholder:text-gray-500 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
                    autoComplete="off"
                    maxLength={80}
                  />
                </div>
              </div>
              <div className="text-left">
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
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left font-medium text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c === 'All Cities' ? '' : c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-left">
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
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left font-medium text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
                >
                  {PRICE_RANGES.map((r) => (
                    <option key={r.label} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {/* Active filter chips */}
              <div className="flex flex-wrap gap-2 text-sm">
                {query.trim() && (
                  <Chip onClear={() => setQuery('')}>Query: “{query.trim()}”</Chip>
                )}
                {city && city !== 'All Cities' && <Chip onClear={() => setCity(CITIES[0])}>City: {city}</Chip>}
                {(selectedRange.min !== undefined || selectedRange.max !== undefined) && (
                  <Chip onClear={() => setPriceKey(PRICE_RANGES[0].label)}>
                    Price: {selectedRange.label}
                  </Chip>
                )}
                {sort !== 'newest' && <Chip onClear={() => setSort('newest')}>Sort: {labelForSort(sort)}</Chip>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={clearFilters}
                >
                  Clear
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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

function labelForSort(key: string): string {
  switch (key) {
    case 'price_low':
      return 'Price Low-High';
    case 'price_high':
      return 'Price High-Low';
    case 'year_new':
      return 'Year Newest';
    case 'year_old':
      return 'Year Oldest';
    default:
      return 'Newest';
  }
}

function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
      {children}
      {onClear && (
        <button
          type="button"
          aria-label="Clear"
          className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs text-gray-300 hover:bg-white/20"
          onClick={onClear}
        >
          ×
        </button>
      )}
    </span>
  );
}

