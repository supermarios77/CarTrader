'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Menu, X } from 'lucide-react';

function AvatarCircle({
  user,
}: {
  user: { firstName?: string | null; lastName?: string | null; email?: string; avatar?: string | null } | null;
}) {
  const initials =
    ((user?.firstName?.[0] || user?.email?.[0] || 'U') as string).toUpperCase() +
    ((user?.lastName?.[0]?.toUpperCase() as string) || '');
  return (
    <Link
      href="/dashboard"
      className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-semibold text-sm ring-1 ring-white/10 hover:ring-white/20 transition-all hover:scale-110"
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
      { href: '/reviews', label: 'Reviews' },
    ],
    [],
  );

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  // Don't show navbar on landing page (it's built into the landing component)
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="fixed top-0 z-[1000] w-full h-20 flex justify-between items-center px-4 md:px-12 bg-[rgba(250,250,250,0.85)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)]">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-lg transition-transform hover:scale-110"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <ul className="flex gap-8 list-none">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href) ? 'text-black' : 'text-[#444] hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logo */}
      <Link href="/" className="font-[var(--font-space-grotesk)] font-bold text-xl md:text-2xl tracking-[-0.03em] absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
        Car<span className="text-[#10b981]">Trader</span>
      </Link>

      <div className="flex gap-3 md:gap-5 items-center">
        {isAuthenticated ? (
          <AvatarCircle user={user} />
        ) : (
          <Link href="/login">
            <button className="hidden md:block bg-[#111] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:bg-[#222]">
              Sign In
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {open && (
        <div className="absolute top-20 left-0 right-0 bg-[rgba(250,250,250,0.98)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.03)] md:hidden">
          <nav className="px-4 py-6">
            <ul className="flex flex-col gap-4 list-none">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-base font-medium transition-colors block py-2 ${
                      isActive(item.href) ? 'text-black' : 'text-[#444] hover:text-black'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {!isAuthenticated && (
                <li className="pt-2 border-t border-[rgba(0,0,0,0.05)]">
                  <Link
                    href="/login"
                    className="text-base font-medium text-[#444] hover:text-black transition-colors block py-2"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
