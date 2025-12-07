'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#10b981]',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  if (lines === 1) {
    return (
      <div
        className={cn('animate-pulse bg-[#e5e5e5] rounded', className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('animate-pulse bg-[#e5e5e5] rounded h-4', className)}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ message, fullScreen = false }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 rounded-[20px]'
      )}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-[#666] font-medium">{message}</p>
      )}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[20px] border border-[#e5e5e5] p-6',
        className
      )}
    >
      <LoadingSkeleton className="h-48 w-full mb-4" />
      <LoadingSkeleton className="h-6 w-3/4 mb-2" />
      <LoadingSkeleton className="h-4 w-1/2" />
    </div>
  );
}

