'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

function AvatarCircle({ user }: { user: { firstName?: string | null; lastName?: string | null; email?: string; avatar?: string | null } | null }) {
  const initials =
    ((user?.firstName?.[0] || user?.email?.[0] || 'U') as string).toUpperCase() +
    ((user?.lastName?.[0]?.toUpperCase() as string) || '');
  return (
    <Link
      href="/dashboard"
      className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10 hover:ring-white/20"
      aria-label="Open dashboard"
      title="Dashboard"
    >
      {user?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt={user.firstName || user.email || 'User'}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span className="text-sm font-semibold text-white">{initials}</span>
      )}
    </Link>
  );
}

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: '/vehicles', label: 'Buy' },
      { href: '/post', label: 'Sell' },
      { href: '/compare', label: 'Compare' },
      { href: '/reviews', label: 'Reviews' },
    ],
    [],
  );

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="relative z-10 grid w-full grid-cols-[auto_1fr_auto] items-center px-6 lg:px-12 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-3" aria-label="Home">
          <div className="h-9 w-9 rounded-md bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-black text-base text-white ring-1 ring-white/10">
            PW
          </div>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl text-white">PakWheels</h1>
        </Link>
      </div>

      <nav className="hidden md:flex items-center justify-center justify-self-center gap-7 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative px-1 text-[0.95rem] transition-colors ${isActive(item.href) ? 'text-white' : 'text-gray-300 hover:text-white'}`}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
            {isActive(item.href) && (
              <span className="pointer-events-none absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-6 rounded-full bg-emerald-500" />
            )}
            <span className="pointer-events-none absolute -bottom-2 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-white/40 transition-all duration-300 group-hover:w-6" />
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 justify-self-end">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 ring-white/10 hover:ring-white/20 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
            {open ? (
              <path fillRule="evenodd" d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3.75 5.25A.75.75 0 0 1 4.5 4.5h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 7.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 6.75a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" clipRule="evenodd" />
            )}
          </svg>
        </button>
        {isAuthenticated ? (
          <AvatarCircle user={user} />
        ) : (
          <Link href="/login" className="hidden md:inline-block">
            <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-5 rounded-lg h-10">
              Sign In
            </Button>
          </Link>
        )}
      </div>

      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-x-0 top-0 z-50 rounded-b-2xl border-b border-white/10 bg-black/90 backdrop-blur-md p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3" onClick={() => setOpen(false)}>
                <div className="h-9 w-9 rounded-md bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-black text-lg text-white ring-1 ring-white/10">
                  PW
                </div>
                <span className="text-lg font-semibold">PakWheels</span>
              </Link>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-white/10 hover:ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
                  <path fillRule="evenodd" d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-base ${isActive(item.href) ? 'bg-white/5 text-white ring-1 ring-white/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-lg bg-white px-3 py-2 text-center font-semibold text-black"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}


