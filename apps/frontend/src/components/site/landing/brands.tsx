'use client';

export function LandingBrands({
  brands,
  selected,
  onSelect,
}: {
  brands: Array<{ id: string; name: string }>;
  selected: string | null; // selected make id
  onSelect: (id: string) => void;
}) {
  return (
    <section className="mb-16">
      <h2 className="mb-6 text-2xl font-black sm:text-3xl">Browse by Brand</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {brands.map((b) => {
          const active = selected === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className={`group relative rounded-2xl border px-6 py-4 font-semibold transition-all duration-300 backdrop-blur-sm ${
                active
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-white/10 text-gray-300 hover:border-cyan-500/40 hover:bg-white/10'
              }`}
              aria-pressed={active}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}


