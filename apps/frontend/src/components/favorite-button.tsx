'use client';

/**
 * Favorite Button Component
 * Reusable component for adding/removing favorites
 */

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addFavorite, removeFavorite } from '@/lib/favorites-api';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  vehicleId: string;
  isFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function FavoriteButton({
  vehicleId,
  isFavorite: initialIsFavorite = false,
  onToggle,
  variant = 'icon',
  size = 'default',
  className,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = React.useRef(true);

  // Sync with prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  // Track mount status to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        await removeFavorite(vehicleId);
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        setIsFavorite(false);
        onToggle?.(false);
      } else {
        await addFavorite(vehicleId);
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        setIsFavorite(true);
        onToggle?.(true);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
      // Revert state on error
      setIsFavorite(!isFavorite);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        type="button"
        variant="ghost"
        size={size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon'}
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'absolute right-2 top-2 z-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]',
          isFavorite && 'text-red-500 hover:text-red-600',
          !isFavorite && 'text-[#666] hover:text-red-500',
          className,
        )}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={cn(
            'transition-all',
            isFavorite && 'fill-current',
            loading && 'animate-pulse',
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isFavorite ? 'default' : 'outline'}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(className)}
    >
      <Heart
        className={cn(
          'mr-2 h-4 w-4 transition-all',
          isFavorite && 'fill-current',
          loading && 'animate-pulse',
        )}
      />
      {isFavorite ? 'Favorited' : 'Add to Favorites'}
    </Button>
  );
}

