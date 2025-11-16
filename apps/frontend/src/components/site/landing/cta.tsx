'use client';
import { Button } from '@/components/ui/button';

export function LandingCta() {
  return (
    <section className="relative overflow-hidden rounded-[3rem] border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 to-emerald-700/10 p-10 sm:p-16">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] [background-size:2rem_2rem]" />
      <div className="relative text-center">
        <h2 className="mb-4 text-4xl font-black sm:text-5xl">Ready to Sell?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-gray-300">
          List your car and reach thousands of buyers. Get the best price with transparent pricing.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button className="rounded-xl bg-linear-to-r from-emerald-500 to-emerald-700 px-10 py-6 font-semibold text-white hover:opacity-90">
            Post Your Car
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-2 border-white/20 bg-transparent px-10 py-6 font-semibold text-white hover:bg-white/10"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}


