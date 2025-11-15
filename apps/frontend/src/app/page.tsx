'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { getAccessToken } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const accessToken = getAccessToken();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50">
            🚗 CarTrader
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A production-ready automotive marketplace platform
          </p>
          <div className="mt-8 flex flex-col gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <p>✅ Next.js Frontend (Port 3000)</p>
            <p>✅ NestJS Backend (Port 3001)</p>
            <p>✅ Monorepo with pnpm db:seedpnpm workspaces</p>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 flex gap-4">
            <Link href="/vehicles">
              <Button size="lg">Browse Vehicles</Button>
            </Link>
            {isAuthenticated && (
              <Link href="/vehicles/new">
                <Button size="lg" variant="outline">List Your Vehicle</Button>
              </Link>
            )}
          </div>

          {/* Auth State Log - For Testing */}
          <div className="mt-12 w-full max-w-md rounded-2xl border-2 border-border/50 bg-muted/30 p-6 text-left backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">🔐 Auth State (Testing)</h2>
            <div className="space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Loading:</span>
                <span className={isLoading ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}>
                  {isLoading ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Token Exists:</span>
                <span className={accessToken ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {accessToken ? 'Yes' : 'No'}
                </span>
              </div>
              {user && (
                <>
                  <div className="mt-3 border-t border-border/50 pt-3">
                    <span className="font-semibold">User ID:</span>
                    <span className="ml-2 text-foreground">{user.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>
                    <span className="ml-2 text-foreground">{user.email}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Role:</span>
                    <span className="ml-2 text-foreground">{user.role}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Email Verified:</span>
                    <span className={`ml-2 ${user.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
