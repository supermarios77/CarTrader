'use client';
import { Button } from '@/components/ui/button';

type Car = {
  id: number;
  name: string;
  price: string;
  year: string;
  mileage: string;
  image: string;
  featured: boolean;
};

export function LandingListings({ cars }: { cars: Car[] }) {
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
          <div
            key={car.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
          >
            {car.featured && (
              <div className="absolute left-4 top-4 z-20 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                FEATURED
              </div>
            )}
            <div className="relative h-40 overflow-hidden">
              <img
                src={car.image || '/placeholder.svg'}
                alt={car.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-bold transition-colors group-hover:text-cyan-400">
                {car.name}
              </h3>
              <div className="mb-4 text-2xl font-black text-cyan-400">{car.price}</div>
              <div className="mb-4 flex justify-between text-sm text-gray-400">
                <span>{car.year}</span>
                <span>{car.mileage}</span>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-lg border-white/20 bg-transparent py-3 font-semibold text-white hover:bg-white/10"
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


