'use client';

import { Review } from '@/types/review';
import { ReviewStars } from './review-stars';
import { formatDistanceToNow } from '@/lib/date-utils';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  canEdit?: boolean;
}

export function ReviewCard({ review, onEdit, onDelete, canEdit = false }: ReviewCardProps) {
  const userName = review.user.firstName && review.user.lastName
    ? `${review.user.firstName} ${review.user.lastName}`
    : review.user.email.split('@')[0];

  const initials = review.user.firstName && review.user.lastName
    ? `${review.user.firstName[0]}${review.user.lastName[0]}`
    : review.user.email[0].toUpperCase();

  return (
    <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.user.avatar ? (
            <Image
              src={review.user.avatar}
              alt={userName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-semibold">
              {initials}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[#111]">{userName}</h4>
              {review.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" title="Verified Review" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ReviewStars rating={review.rating} size="sm" />
              <span className="text-xs text-[#888]">
                {formatDistanceToNow(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {canEdit && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="text-sm text-[#10b981] hover:underline"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {review.title && (
        <h5 className="font-semibold text-[#111] mb-2">{review.title}</h5>
      )}

      {review.comment && (
        <p className="text-[#666] leading-relaxed whitespace-pre-wrap">{review.comment}</p>
      )}
    </div>
  );
}

