'use client';

import { useEffect, useState } from 'react';
import { LandingHero } from './landing/hero';
import { LandingFeatures } from './landing/features';
import { LandingListings } from './landing/listings';
import { LandingBrands } from './landing/brands';
import { LandingCta } from './landing/cta';

type Car = {
  id: number;
  name: string;
  price: string;
  year: string;
  mileage: string;
  image: string;
  featured: boolean;
};

const POPULAR_CARS: Car[] = [
  {
    id: 1,
    name: 'Honda City 2024',
    price: 'PKR 2,850,000',
    year: '2024',
    mileage: 'Brand New',
    image: '/honda-city-silver.jpg',
    featured: true,
  },
  {
    id: 2,
    name: 'Toyota Corolla 2023',
    price: 'PKR 2,450,000',
    year: '2023',
    mileage: '5,000 km',
    image: '/toyota-corolla-white.jpg',
    featured: false,
  },
  {
    id: 3,
    name: 'Suzuki Cultus 2022',
    price: 'PKR 1,850,000',
    year: '2022',
    mileage: '25,000 km',
    image: '/suzuki-cultus-red.jpg',
    featured: false,
  },
  {
    id: 4,
    name: 'Hyundai Elantra 2024',
    price: 'PKR 3,200,000',
    year: '2024',
    mileage: '8,000 km',
    image: '/hyundai-elantra-black.jpg',
    featured: true,
  },
];

const BRANDS = [
  'Honda',
  'Toyota',
  'Suzuki',
  'Hyundai',
  'KIA',
  'Daihatsu',
  'BMW',
  'Mercedes',
  'Audi',
  'Lexus',
  'Subaru',
  'Volkswagen',
];

const FEATURES = [
  { icon: '✓', title: 'Verified Sellers', desc: 'All dealers verified' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Safe transaction' },
  { icon: '📋', title: 'Complete History', desc: 'Full vehicle report' },
  { icon: '🚗', title: '5000+ Cars', desc: 'Browse inventory' },
];

export function Landing() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black" />

      {/* Header lives in layout via Navbar; keeping this section empty intentionally */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pt-16 md:pt-20 lg:px-12 lg:pt-24">
        <LandingHero />
        <LandingFeatures />

        {/* Featured listings */}
        <LandingListings cars={POPULAR_CARS} />

        {/* Brands */}
        <LandingBrands brands={BRANDS} selected={selectedBrand} onSelect={setSelectedBrand} />

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


