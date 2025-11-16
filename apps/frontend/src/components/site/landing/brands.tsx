'use client';

import Link from 'next/link';

export function LandingBrands({
  brands,
}: {
  brands: Array<{ id: string; name: string; slug?: string | null; logo?: string | null }>;
}) {
  return (
    <section className="mb-16">
      <h2 className="mb-6 text-2xl font-black sm:text-3xl">Browse by Brand</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/vehicles?makeId=${encodeURIComponent(b.id)}`}
            className="group relative flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 font-semibold text-gray-300 transition-colors hover:border-emerald-500/40 hover:bg-white/10 hover:text-white"
            aria-label={`Browse ${b.name} vehicles`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {b.logo ? (
              <img
                src={b.logo}
                alt={`${b.name} logo`}
                className="h-7 w-7 rounded bg-white object-contain p-1"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-white/10 text-xs text-white">
                {b.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="truncate">{b.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}


