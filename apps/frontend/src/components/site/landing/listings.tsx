'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Car = {
  id: string;
  name: string;
  price: string;
  year: string;
  mileage: string;
  image: string;
  featured: boolean;
};

type CardItem = {
  id: string;
  name: string;
  price: string;
  year: string;
  mileage: string;
  image: string;
  featured: boolean;
};

export function LandingListings({ cars }: { cars: CardItem[] }) {
  function ImageWithSkeleton({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const displaySrc = !error && src ? src : '/placeholder.svg';
    return (
      <div className={`relative ${className || ''}`}>
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-white/10" aria-hidden="true" />
        )}
        {/* Image */}
        <img
          src={displaySrc}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
        />
      </div>
    );
  }

  return (
    <section className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black sm:text-3xl">Featured Listings</h2>
        <a
          href="/vehicles"
          className="text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
        >
          View All →
        </a>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cars.map((car) => (
          <Link
            key={car.id}
            href={`/vehicles/${car.id}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
          >
            {car.featured && (
              <div className="absolute left-4 top-4 z-20 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                FEATURED
              </div>
            )}
            {/* Image takes more vertical space; subtle gradient overlay for text legibility */}
            <div className="relative overflow-hidden aspect-16/10 md:aspect-video">
              <ImageWithSkeleton
                src={car.image || '/placeholder.svg'}
                alt={car.name}
                className="h-full w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-black/0 to-black/0" />
              {/* Price badge on image */}
              <div className="absolute bottom-3 left-3 z-20 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-emerald-300 ring-1 ring-white/10 backdrop-blur">
                {car.price}
              </div>
            </div>
            <div className="p-5">
              <h3 className="mb-1 line-clamp-1 text-base font-semibold transition-colors group-hover:text-cyan-400">
                {car.name}
              </h3>
              <div className="mb-3 flex justify-between text-xs text-gray-400">
                <span>{car.year}</span>
                <span>{car.mileage}</span>
              </div>
              <div className="w-full rounded-lg border border-white/20 bg-transparent py-2.5 text-center text-sm font-semibold text-white transition-colors group-hover:bg-white/10">
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


