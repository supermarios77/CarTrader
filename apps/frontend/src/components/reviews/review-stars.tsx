'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export function ReviewStars({ rating, size = 'md', showNumber = false, className }: ReviewStarsProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(sizes[size], 'fill-[#ffb800] text-[#ffb800]')}
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className={cn(sizes[size], 'text-[#e5e5e5]')} />
            <Star
              className={cn(sizes[size], 'fill-[#ffb800] text-[#ffb800] absolute inset-0 overflow-hidden')}
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(sizes[size], 'text-[#e5e5e5]')}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-[#666] ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function RatingSelector({ value, onChange, disabled = false }: RatingSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => !disabled && onChange(rating)}
          disabled={disabled}
          className={cn(
            'transition-all',
            !disabled && 'hover:scale-110 cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <Star
            className={cn(
              'w-8 h-8 transition-colors',
              value >= rating
                ? 'fill-[#ffb800] text-[#ffb800]'
                : 'text-[#e5e5e5] hover:text-[#ffb800]'
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-[#666]">
          {value} {value === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
}

