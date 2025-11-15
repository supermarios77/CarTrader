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
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Sync with prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        await removeFavorite(vehicleId);
        // Check if request was aborted
        if (abortController.signal.aborted) return;
        setIsFavorite(false);
        onToggle?.(false);
      } else {
        await addFavorite(vehicleId);
        // Check if request was aborted
        if (abortController.signal.aborted) return;
        setIsFavorite(true);
        onToggle?.(true);
      }
    } catch (err) {
      // Don't update state if request was aborted
      if (abortController.signal.aborted) return;
      
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
      // Revert state on error
      setIsFavorite(!isFavorite);
    } finally {
      if (!abortController.signal.aborted) {
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
          'absolute right-2 top-2 z-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background',
          isFavorite && 'text-red-500 hover:text-red-600',
          !isFavorite && 'text-muted-foreground hover:text-red-500',
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

