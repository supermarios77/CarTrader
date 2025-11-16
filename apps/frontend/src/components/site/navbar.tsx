'use client';

import Link from 'next/link';
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

  return (
    <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto border-b border-white/5 bg-black">
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-3" aria-label="Home">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-black text-xl text-white">
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

      {isAuthenticated ? (
        <AvatarCircle user={user} />
      ) : (
        <Link href="/login">
          <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-6 rounded-lg">
            Sign In
          </Button>
        </Link>
      )}
    </header>
  );
}


