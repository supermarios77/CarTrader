'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto border-b border-white/5 bg-black">
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-3" aria-label="Home">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center font-black text-xl text-white">
            PW
          </div>
          <h1 className="text-2xl font-bold">PakWheels</h1>
        </Link>
      </div>

      <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
        <Link href="/vehicles" className="text-gray-400 hover:text-white transition-colors">
          Buy
        </Link>
        <Link href="/post" className="text-gray-400 hover:text-white transition-colors">
          Sell
        </Link>
        <Link href="/compare" className="text-gray-400 hover:text-white transition-colors">
          Compare
        </Link>
        <Link href="/reviews" className="text-gray-400 hover:text-white transition-colors">
          Reviews
        </Link>
      </nav>

      <Link href="/login">
        <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-6 rounded-lg">
          Sign In
        </Button>
      </Link>
    </header>
  );
}


