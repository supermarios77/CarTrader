'use client';

import { useEffect, useState } from 'react';
import { LandingHero } from './landing/hero';
import { LandingFeatures } from './landing/features';
import { LandingListings } from './landing/listings';
import { LandingBrands } from './landing/brands';
import { LandingCta } from './landing/cta';
import { getFeaturedVehicles } from '@/lib/vehicles-api';
import type { Vehicle } from '@/types/vehicle';
import { getAllMakes, type Make } from '@/lib/catalog-api';

// no local Card type; data is mapped inline for the listings component

export function Landing() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [featured, setFeatured] = useState<Vehicle[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Make[] | null>(null);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFeaturedVehicles(8);
        if (!active) return;
        setFeatured(data);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load featured vehicles');
        setFeatured(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    // Load makes (brands)
    (async () => {
      try {
        setBrandsError(null);
        const list = await getAllMakes();
        if (!active) return;
        setBrands(list);
      } catch (e) {
        if (!active) return;
        setBrandsError(e instanceof Error ? e.message : 'Failed to load brands');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Simple hash for stable numeric id fallback
  function iHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />

      {/* Header lives in layout via Navbar; keeping this section empty intentionally */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pt-16 md:pt-20 lg:px-12 lg:pt-24">
        <LandingHero />
        <LandingFeatures />

        {/* Featured listings - use real data when available, fallback to static */}
        {error && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Failed to load featured vehicles. {error}
          </div>
        )}
        {loading ? (
          <section className="mb-16">
            <div className="mb-6 h-7 w-48 rounded bg-white/10" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
              ))}
            </div>
          </section>
        ) : featured && featured.length > 0 ? (
          <LandingListings
            cars={featured.map((v) => ({
              id: Number.isNaN(Number(v.id)) ? Math.random() : Number((v.id as unknown) as number) || iHash(v.id),
              name: v.title,
              price: `${v.currency} ${Number(v.price).toLocaleString()}`,
              year: String(v.year),
              mileage: v.mileage ? `${v.mileage.toLocaleString()} km` : '—',
              image: v.images?.[0]?.url || '/placeholder.svg',
              featured: Boolean(v.featured),
            }))}
          />
        ) : (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-black sm:text-3xl">Featured Listings</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-400">
              There are currently no featured vehicles. Check back soon.
            </div>
          </section>
        )}

        {/* Brands */}
        {brandsError && (
          <div className="mb-6 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
            Failed to load brands. {brandsError}
          </div>
        )}
        {brands && brands.length > 0 && (
          <LandingBrands
            brands={brands.map((m) => ({ id: m.id, name: m.name }))}
            selected={selectedBrand}
            onSelect={setSelectedBrand}
          />
        )}

        {/* CTA */}
        <LandingCta />
      </main>

      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 font-bold">Company</div>
              <div className="space-y-3 text-sm text-gray-400">
                <a href="#" className="block transition-colors hover:text-white">
                  About
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  Careers
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  Blog
                </a>
              </div>
            </div>
            <div>
              <div className="mb-4 font-bold">Support</div>
              <div className="space-y-3 text-sm text-gray-400">
                <a href="#" className="block transition-colors hover:text-white">
                  Contact
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  FAQ
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  Help Center
                </a>
              </div>
            </div>
            <div>
              <div className="mb-4 font-bold">Legal</div>
              <div className="space-y-3 text-sm text-gray-400">
                <a href="#" className="block transition-colors hover:text-white">
                  Terms
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  Privacy
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  Cookies
                </a>
              </div>
            </div>
            <div>
              <div className="mb-4 font-bold">Follow</div>
              <div className="space-y-3 text-sm text-gray-400">
                <a href="#" className="block transition-colors hover:text-white">
                  Twitter
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  Facebook
                </a>
                <a href="#" className="block transition-colors hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} CarTrader. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


