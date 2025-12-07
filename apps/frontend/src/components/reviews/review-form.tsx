'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RatingSelector } from './review-stars';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useToast } from '@/components/ui/toast';
import { createReview, updateReview, type CreateReviewData, type UpdateReviewData, type Review } from '@/lib/reviews-api';
import { LoadingSpinner } from '@/components/ui/loading';

interface ReviewFormProps {
  vehicleId: string;
  existingReview?: Review | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ vehicleId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const { handleError } = useErrorHandler();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim() && !title.trim()) {
      toast.error('Please provide a title or comment');
      return;
    }

    setSubmitting(true);

    try {
      const data: CreateReviewData | UpdateReviewData = {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      };

      if (existingReview) {
        await updateReview(existingReview.id, data);
        toast.success('Review updated successfully');
      } else {
        await createReview(vehicleId, data);
        toast.success('Review submitted successfully');
      }

      onSuccess();
    } catch (error) {
      handleError(error, {
        customMessage: existingReview ? 'Failed to update review' : 'Failed to submit review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <h3 className="text-xl font-semibold text-[#111] mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#111] mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <RatingSelector value={rating} onChange={setRating} disabled={submitting} />
        </div>

        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-[#111] mb-2">
            Title (Optional)
          </label>
          <Input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your experience"
            maxLength={100}
            disabled={submitting}
            className="rounded-full"
          />
        </div>

        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-[#111] mb-2">
            Review <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this vehicle..."
            rows={5}
            maxLength={2000}
            disabled={submitting}
            className="rounded-[12px]"
          />
          <p className="text-xs text-[#888] mt-1">
            {comment.length} / 2000 characters
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting || rating === 0}
            className="bg-[#111] text-white hover:bg-[#222] flex items-center gap-2"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                {existingReview ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              existingReview ? 'Update Review' : 'Submit Review'
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="border-[#e5e5e5] text-[#111] hover:bg-[#fafafa]"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

