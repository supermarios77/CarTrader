'use client';

import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useId, useState } from 'react';

export function Hero() {
  const idMake = useId();
  const idCity = useId();
  const idPrice = useId();

  const [make, setMake] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-sky-950 via-slate-900 to-background"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <div className="max-w-3xl">
          <h1
            id="hero-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
          >
            Find Used Cars in Pakistan
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/80">
            With thousands of cars, we help you discover the right one, fast.
          </p>
        </div>

        {/* Search panel */}
        <form
          className="mt-6 sm:mt-8 rounded-xl border bg-background/90 p-3 sm:p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/70"
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams();
            if (make) params.set('q', make);
            if (city) params.set('city', city);
            if (price) params.set('price', price);
            window.location.href = `/vehicles?${params.toString()}`;
          }}
          aria-label="Vehicle search"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor={idMake} className="sr-only">
                Car make or model
              </label>
              <input
                id={idMake}
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Car Make or Model"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-primary"
                maxLength={64}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor={idCity} className="sr-only">
                City
              </label>
              <input
                id={idCity}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="All Cities"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-primary"
                maxLength={48}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor={idPrice} className="sr-only">
                Price range
              </label>
              <input
                id={idPrice}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price Range"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:ring-2 focus-visible:ring-primary"
                maxLength={32}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Link
              href="/vehicles?advanced=1"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filter
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}


