'use client';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type PriceRange = { label: string; min?: number; max?: number };

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

const PRICE_RANGES: PriceRange[] = [
  { label: 'Any Price' },
  { label: 'Up to PKR 1,000,000', max: 1_000_000 },
  { label: 'PKR 1,000,000 - 2,000,000', min: 1_000_000, max: 2_000_000 },
  { label: 'PKR 2,000,000 - 3,500,000', min: 2_000_000, max: 3_500_000 },
  { label: 'PKR 3,500,000 - 5,000,000', min: 3_500_000, max: 5_000_000 },
  { label: 'PKR 5,000,000 - 7,500,000', min: 5_000_000, max: 7_500_000 },
  { label: 'PKR 7,500,000 - 10,000,000', min: 7_500_000, max: 10_000_000 },
  { label: 'Above PKR 10,000,000', min: 10_000_000 },
];

export function LandingHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  const [query, setQuery] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [priceKey, setPriceKey] = useState(PRICE_RANGES[0].label);

  const selectedRange = useMemo(
    () => PRICE_RANGES.find((r) => r.label === priceKey) || PRICE_RANGES[0],
    [priceKey],
  );

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (city && city !== 'All Cities') params.set('city', city);
    if (selectedRange.min !== undefined) params.set('minPrice', String(selectedRange.min));
    if (selectedRange.max !== undefined) params.set('maxPrice', String(selectedRange.max));
    window.location.href = `/vehicles?${params.toString()}`;
  }

  return (
    <div
      className={`text-center transition-all duration-1000 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl">
        Find Your Perfect
        <br />
        <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
          Car Today
        </span>
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-gray-400 sm:text-xl">
        Browse 5000+ verified listings from trusted sellers across Pakistan
      </p>

      <form
        onSubmit={handleSearch}
        className="mx-auto mb-12 max-w-4xl rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-lg sm:p-8"
        aria-label="Vehicle search"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {/* Make / Model text input */}
          <div className="text-left">
            <label htmlFor="q" className="sr-only">
              Make or Model
            </label>
            <input
              id="q"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Car make or model"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-medium text-white placeholder:text-gray-500 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
              autoComplete="off"
              maxLength={80}
            />
          </div>

          {/* City dropdown */}
          <div className="text-left">
            <label htmlFor="city" className="sr-only">
              City
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-left font-medium text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Price dropdown */}
          <div className="text-left">
            <label htmlFor="price" className="sr-only">
              Price Range
            </label>
            <select
              id="price"
              value={priceKey}
              onChange={(e) => setPriceKey(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-left font-medium text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.label} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-3 font-semibold text-white hover:opacity-90">
            Search Cars
          </Button>
        </div>
      </form>
    </div>
  );
}


