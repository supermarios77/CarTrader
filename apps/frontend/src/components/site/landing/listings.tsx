'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-[#f5f5f5]" aria-hidden="true" />
        )}
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
        <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold sm:text-3xl">Featured Listings</h2>
        <Link
          href="/vehicles"
          className="text-sm font-semibold text-[#10b981] transition-colors hover:text-[#059669]"
        >
          View All →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cars.map((car) => (
          <Link
            key={car.id}
            href={`/vehicles/${car.id}`}
            className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
          >
            {car.featured && (
              <div className="absolute left-4 top-4 z-20 rounded-full bg-[#10b981] px-3 py-1 text-xs font-bold text-white">
                FEATURED
              </div>
            )}
            <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5] relative">
              <ImageWithSkeleton
                src={car.image || '/placeholder.svg'}
                alt={car.name}
                className="h-full w-full"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-[#10b981]">
                {car.price}
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-base block mb-1">{car.name}</span>
                <span className="text-xs text-[#888]">
                  {car.year} • {car.mileage}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
