'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  const [budget, setBudget] = useState<number>(500000);

  return (
    <div
      className={`text-center transition-all duration-1000 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl">
        Find Your Perfect
        <br />
        <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          Car Today
        </span>
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-gray-400 sm:text-xl">
        Browse 5000+ verified listings from trusted sellers across Pakistan
      </p>
      <div className="mx-auto mb-12 max-w-4xl rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-lg sm:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search by brand or model"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-medium text-white placeholder:text-gray-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10"
          />
          <div>
            <input
              type="range"
              min={100000}
              max={10000000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-500"
            />
            <div className="mt-2 text-sm text-gray-400">Budget: PKR {budget.toLocaleString()}</div>
          </div>
          <Button className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 py-4 font-semibold text-white hover:opacity-90">
            Search Cars
          </Button>
        </div>
      </div>
    </div>
  );
}


