'use client';

import { useEffect, useState } from 'react';
import { ReviewStars } from './review-stars';
import { getSellerRatingStats, type ReviewStats } from '@/lib/reviews-api';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { LoadingSpinner } from '@/components/ui/loading';

interface SellerRatingProps {
  sellerId: string;
  className?: string;
}

export function SellerRating({ sellerId, className }: SellerRatingProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleAsyncError } = useErrorHandler();

  useEffect(() => {
    loadStats();
  }, [sellerId]);

  const loadStats = async () => {
    setLoading(true);
    const result = await handleAsyncError(
      async () => await getSellerRatingStats(sellerId),
      { showToast: false }
    );

    if (result) {
      setStats(result);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={className}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <ReviewStars rating={stats.averageRating} size="sm" showNumber={true} />
        <span className="text-sm text-[#666]">
          ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    </div>
  );
}

