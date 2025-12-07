'use client';

import { useEffect, useState } from 'react';
import { Search, Menu, X, ArrowUp, ArrowRight, Car, Shield, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getFeaturedVehicles, getVehicles } from '@/lib/vehicles-api';
import type { Vehicle } from '@/types/vehicle';
import { VehicleStatus } from '@/types/vehicle';
import { getAllMakes, type Make } from '@/lib/catalog-api';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';

const CITIES = [
  'All Cities',
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Quetta',
  'Faisalabad',
  'Multan',
  'Sialkot',
];

const PRICE_RANGES = [
  { label: 'Any Price' },
  { label: 'Up to PKR 1,000,000', max: 1_000_000 },
  { label: 'PKR 1,000,000 - 2,000,000', min: 1_000_000, max: 2_000_000 },
  { label: 'PKR 2,000,000 - 3,500,000', min: 2_000_000, max: 3_500_000 },
  { label: 'PKR 3,500,000 - 5,000,000', min: 3_500_000, max: 5_000_000 },
  { label: 'PKR 5,000,000 - 7,500,000', min: 5_000_000, max: 7_500_000 },
  { label: 'PKR 7,500,000 - 10,000,000', min: 7_500_000, max: 10_000_000 },
  { label: 'Above PKR 10,000,000', min: 10_000_000 },
];

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [featured, setFeatured] = useState<Vehicle[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setBrands] = useState<Make[] | null>(null);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [priceKey, setPriceKey] = useState(PRICE_RANGES[0].label);
  const { isAuthenticated, user } = useAuth();

  const selectedRange = PRICE_RANGES.find((r) => r.label === priceKey) || PRICE_RANGES[0];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // First try to get featured vehicles
        const featuredData = await getFeaturedVehicles(8);
        if (!active) return;
        
        // If we have featured vehicles, use them
        if (featuredData && featuredData.length > 0) {
          setFeatured(featuredData);
        } else {
          // Fallback: get recent active vehicles if no featured vehicles
          const recentData = await getVehicles({ 
            status: VehicleStatus.ACTIVE, 
            limit: 8,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          });
          if (!active) return;
          setFeatured(Array.isArray(recentData.vehicles) ? recentData.vehicles : []);
        }
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load vehicles');
        setFeatured(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    (async () => {
      try {
        const list = await getAllMakes();
        if (!active) return;
        setBrands(list);
      } catch {
        if (!active) return;
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (city && city !== 'All Cities') params.set('city', city);
    if (selectedRange.min !== undefined) params.set('minPrice', String(selectedRange.min));
    if (selectedRange.max !== undefined) params.set('maxPrice', String(selectedRange.max));
    window.location.href = `/vehicles?${params.toString()}`;
  }

  const formatPrice = (price: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] overflow-x-hidden">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      {/* Header */}
      <header className="fixed top-0 z-1000 w-full h-20 flex justify-between items-center px-4 md:px-12 bg-[rgba(250,250,250,0.85)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)]">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-lg transition-transform hover:scale-110"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-8 list-none">
            <li>
              <Link href="/vehicles" className="text-sm font-medium text-[#444] hover:text-black transition-colors">
                Buy
              </Link>
            </li>
            <li>
              <Link href="/post" className="text-sm font-medium text-[#444] hover:text-black transition-colors">
                Sell
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="text-sm font-medium text-[#444] hover:text-black transition-colors">
                Reviews
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logo */}
        <div className="font-[var(--font-space-grotesk)] font-bold text-xl md:text-2xl tracking-[-0.03em] absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
          Car<span className="text-[#10b981]">Trader</span>
        </div>

        <div className="flex gap-3 md:gap-5 items-center">
          <Link
            href="/vehicles"
            className="hidden md:block text-lg transition-transform hover:scale-110"
            aria-label="Search"
          >
            <Search className="w-6 h-6" />
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-semibold text-sm ring-1 ring-white/10 hover:ring-white/20 transition-all"
              aria-label="Dashboard"
            >
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </Link>
          ) : (
            <Link href="/login">
              <button className="hidden md:block bg-[#111] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:bg-[#222]">
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-[rgba(250,250,250,0.98)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] md:hidden">
            <nav className="px-4 py-6">
              <ul className="flex flex-col gap-4 list-none">
                <li>
                  <Link
                    href="/vehicles"
                    className="text-base font-medium text-[#444] hover:text-black transition-colors block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Buy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/post"
                    className="text-base font-medium text-[#444] hover:text-black transition-colors block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sell
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reviews"
                    className="text-base font-medium text-[#444] hover:text-black transition-colors block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Reviews
                  </Link>
                </li>
                <li className="pt-2 border-t border-[rgba(0,0,0,0.05)]">
                  <Link
                    href="/vehicles"
                    className="text-base font-medium text-[#444] hover:text-black transition-colors flex items-center gap-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main Hero */}
      <main className="relative max-w-[1400px] w-full mx-auto min-h-screen pt-36 pb-16 px-4 md:px-12 grid md:grid-cols-2 items-center gap-16">
        <div className="z-2">
          <div className="inline-flex items-center px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2" />
            New Listings Daily
          </div>

          <h1 className="font-[var(--font-space-grotesk)] text-[76px] leading-[0.95] font-semibold tracking-[-0.03em] mb-6 text-black">
            Find Your Dream <br />
            <span className="italic font-normal bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent">
              Car Today.
            </span>
          </h1>

          <p className="text-lg leading-relaxed text-[#555] max-w-[460px] mb-10">
            Browse thousands of verified vehicles from trusted sellers. 100% transparent listings, secure transactions,
            and the best deals on wheels. Your next ride is just a click away.
          </p>

          {/* Search Form */}
          <form onSubmit={(e) => handleSearch(e)} className="mb-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Car make or model"
                className="w-full px-6 py-4 rounded-full border border-[#e5e5e5] bg-white text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all"
              />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-6 py-4 rounded-full border border-[#e5e5e5] bg-white text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all appearance-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={priceKey}
                onChange={(e) => setPriceKey(e.target.value)}
                className="w-full px-6 py-4 rounded-full border border-[#e5e5e5] bg-white text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] transition-all appearance-none"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.label} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-[#111] text-white px-9 py-[18px] rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] inline-flex items-center gap-2.5 justify-center"
            >
              Search Cars
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="flex gap-4 items-center">
            <Link
              href="/vehicles"
              className="bg-[#111] text-white px-9 py-[18px] rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] inline-flex items-center gap-2.5"
            >
              Browse All Cars
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/post"
              className="px-9 py-[18px] rounded-full font-semibold text-base bg-[rgba(255,255,255,0.5)] border border-[#e5e5e5] transition-all hover:bg-white hover:border-black"
            >
              Sell Your Car
            </Link>
          </div>
        </div>

        <div className="relative h-[700px] w-full">
          {featured && featured.length > 0 && featured[0]?.images?.[0]?.url ? (
            <div className="group w-full h-full rounded-[40px] overflow-hidden relative -rotate-2 transition-transform duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:rotate-0">
              <Image
                src={featured[0].images[0].url}
                alt={featured[0].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 700px"
              />
              <div className="absolute top-5 left-5 z-4 w-[100px] h-[100px] flex items-center justify-center bg-[#10b981] rounded-full text-white font-extrabold font-[var(--font-space-grotesk)] text-center rotate-15 shadow-[0_10px_20px_rgba(0,0,0,0.1)] text-sm leading-tight">
                FEATURED
              </div>
            </div>
          ) : (
            <div className="group w-full h-full rounded-[40px] overflow-hidden relative -rotate-2 transition-transform duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:rotate-0 bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
              <Car className="w-32 h-32 text-white opacity-50" />
            </div>
          )}

          {/* Floating Glassmorphism Vehicle Card 1 */}
          {featured && featured.length > 1 && featured[1] && (
            <div className="floating-card absolute bottom-[60px] left-[-40px] bg-[rgba(255,255,255,0.7)] backdrop-blur-2xl p-4 rounded-[20px] border border-[rgba(255,255,255,0.6)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex items-center gap-3 z-3 animate-[float_6s_ease-in-out_infinite]">
              {featured[1].images?.[0]?.url ? (
                <Image
                  src={featured[1].images[0].url}
                  alt={featured[1].title}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold mb-0.5">{featured[1].title}</h4>
                <p className="text-xs text-[#666]">{featured[1].year} • {featured[1].mileage?.toLocaleString()} km</p>
                <div className="text-[#10b981] text-xs mt-0.5 font-semibold">
                  {formatPrice(Number(featured[1].price), featured[1].currency)}
                </div>
              </div>
            </div>
          )}

          {/* Floating Glassmorphism Vehicle Card 2 */}
          {featured && featured.length > 2 && featured[2] && (
            <div className="floating-card absolute top-20 right-[-20px] bg-[rgba(255,255,255,0.7)] backdrop-blur-2xl p-4 rounded-[20px] border border-[rgba(255,255,255,0.6)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] flex items-center gap-3 z-3 animate-[float_6s_ease-in-out_1.5s_infinite]">
              {featured[2].images?.[0]?.url ? (
                <Image
                  src={featured[2].images[0].url}
                  alt={featured[2].title}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold mb-0.5">{featured[2].title}</h4>
                <p className="text-xs text-[#666]">{featured[2].year} • {featured[2].mileage?.toLocaleString()} km</p>
                <div className="text-[#10b981] text-xs mt-0.5 font-semibold">
                  {formatPrice(Number(featured[2].price), featured[2].currency)}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Marquee Ticker */}
      <div className="w-full bg-[#111] text-white py-4 overflow-hidden whitespace-nowrap relative -rotate-1 scale-[1.02] -mt-10 z-5 border-t border-b border-[#333]">
        <div className="inline-block animate-[marquee_20s_linear_infinite]">
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            ✨ VERIFIED SELLERS
          </span>
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            🚗 5000+ CARS
          </span>
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            🔒 SECURE TRANSACTIONS
          </span>
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            📋 COMPLETE HISTORY
          </span>
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            ✨ VERIFIED SELLERS
          </span>
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            🚗 5000+ CARS
          </span>
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            🔒 SECURE TRANSACTIONS
          </span>
          <span className="font-[var(--font-space-grotesk)] text-lg font-medium uppercase px-10 tracking-wider">
            📋 COMPLETE HISTORY
          </span>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <Shield className="w-8 h-8 text-[#10b981] mb-4" />
            <h3 className="font-semibold text-base mb-1">Verified Sellers</h3>
            <p className="text-xs text-[#888]">All dealers verified</p>
          </div>
          <div className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <FileText className="w-8 h-8 text-[#10b981] mb-4" />
            <h3 className="font-semibold text-base mb-1">Complete History</h3>
            <p className="text-xs text-[#888]">Full vehicle report</p>
          </div>
          <div className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <Car className="w-8 h-8 text-[#10b981] mb-4" />
            <h3 className="font-semibold text-base mb-1">5000+ Cars</h3>
            <p className="text-xs text-[#888]">Browse inventory</p>
          </div>
          <div className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <TrendingUp className="w-8 h-8 text-[#10b981] mb-4" />
            <h3 className="font-semibold text-base mb-1">Best Prices</h3>
            <p className="text-xs text-[#888]">Competitive deals</p>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <h3 className="font-[var(--font-space-grotesk)] text-[32px]">Trending Now</h3>
          <Link href="/vehicles" className="underline font-medium">
            See All Cars
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse bg-white rounded-[20px]" />
              ))}
            </div>
        ) : error ? (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-8 text-center text-red-600">
            {error}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {featured.slice(0, 4).map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="group bg-white rounded-[20px] p-6 transition-all duration-300 cursor-pointer border border-transparent hover:translate-y-[-10px] hover:border-[#eee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
              >
                <div className="w-full h-60 rounded-xl overflow-hidden mb-5 bg-[#f5f5f5]">
                  {vehicle.images?.[0]?.url ? (
                    <Image
                      src={vehicle.images[0].url}
                      alt={vehicle.title}
                      width={300}
                      height={240}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                      <Car className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-base block mb-1">{vehicle.title}</span>
                    <span className="text-xs text-[#888]">
                      {vehicle.year} • {vehicle.mileage?.toLocaleString()} km
                    </span>
                  </div>
                  <span className="font-[var(--font-space-grotesk)] font-bold text-[#10b981]">
                    {formatPrice(Number(vehicle.price), vehicle.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-[#eee] bg-white p-8 text-center text-[#888]">
            No vehicles available at the moment. <Link href="/post" className="text-[#10b981] hover:underline font-semibold">List your car</Link> to get started!
            </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-40 blur-[100px] bg-[radial-gradient(circle,rgb(16,185,129)_0%,rgba(255,255,255,0)_70%)]" />
        <div className="relative bg-gradient-to-br from-white to-[#f0fdf4] rounded-[40px] p-16 border border-[rgba(16,185,129,0.1)] shadow-[0_40px_80px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(16,185,129)_0%,rgba(255,255,255,0)_70%)]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full opacity-20 blur-[60px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
          <div className="relative max-w-[700px] mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white border border-[#d1fae5] rounded-full text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_4px_12px_rgba(16,185,129,0.08)]">
              <span className="w-2 h-2 bg-[#10b981] rounded-full mr-2 animate-pulse" />
              Sell Your Car
            </div>
            <h2 className="font-[var(--font-space-grotesk)] text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-6 text-black">
              Ready to Sell Your
              <br />
              <span className="italic font-normal bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent">
                Vehicle?
              </span>
            </h2>
            <p className="text-lg leading-relaxed text-[#555] mb-10 max-w-[540px] mx-auto">
              List your car in minutes. Reach thousands of buyers and get the best price for your vehicle. Free
              listings, verified buyers, secure transactions.
            </p>
            <Link
              href="/post"
              className="bg-[#111] text-white px-9 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-[#222] inline-flex items-center justify-center gap-2.5 whitespace-nowrap"
            >
              List Your Car Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20 bg-gradient-to-br from-[#111] to-[#1a1a1a] text-white pt-20 pb-8 px-4 md:px-12 overflow-hidden">
        <div className="absolute top-0 right-[20%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] bg-[radial-gradient(circle,rgb(16,185,129)_0%,rgba(255,255,255,0)_70%)]" />
        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="font-[var(--font-space-grotesk)] font-bold text-3xl tracking-[-0.03em] mb-4">
                Car<span className="text-[#10b981]">Trader</span>
              </div>
              <p className="text-sm text-[#999] leading-relaxed mb-6">
                Your trusted marketplace for buying and selling vehicles. Verified sellers, secure transactions, and the
                best deals on wheels.
              </p>
            </div>
            <div>
              <h4 className="font-[var(--font-space-grotesk)] font-semibold text-base mb-6">Shop</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/vehicles" className="text-sm text-[#999] hover:text-white transition-colors">
                    Browse Cars
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles?featured=true" className="text-sm text-[#999] hover:text-white transition-colors">
                    Featured Listings
                  </Link>
                </li>
                <li>
                  <Link href="/post" className="text-sm text-[#999] hover:text-white transition-colors">
                    Sell Your Car
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Space_Grotesk'] font-semibold text-base mb-6">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Space_Grotesk'] font-semibold text-base mb-6">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#999] hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[rgba(255,255,255,0.1)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#666] text-center md:text-left">
              © {new Date().getFullYear()} CarTrader. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-[#666] hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-999 w-12 h-12 rounded-full bg-white/80 backdrop-blur-xl border border-[rgba(0,0,0,0.06)] shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] active:scale-95 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 text-[#10b981]" />
      </button>
    </div>
  );
}
