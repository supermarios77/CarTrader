'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, consider sending to error tracking service
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <h2 className="text-2xl font-bold text-[#111]">Something went wrong</h2>
            <p className="text-[#666]">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-[#111] text-white hover:bg-[#222] font-semibold transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


