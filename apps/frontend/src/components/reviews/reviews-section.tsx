'use client';

import { useState, useEffect } from 'react';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { ReviewStars } from './review-stars';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useAuth } from '@/contexts/auth-context';
import {
  getVehicleReviews,
  getUserReviewForVehicle,
  deleteReview,
  type Review,
  type ReviewStats,
} from '@/lib/reviews-api';
import { Star, Plus, Edit2 } from 'lucide-react';

interface ReviewsSectionProps {
  vehicleId: string;
  sellerId: string;
}

export function ReviewsSection({ vehicleId, sellerId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { handleError, handleAsyncError } = useErrorHandler();

  const isOwner = user?.id === sellerId;
  const canReview = isAuthenticated && !isOwner && !userReview && !editingReview;

  useEffect(() => {
    loadReviews();
    if (isAuthenticated && !isOwner) {
      loadUserReview();
    }
  }, [vehicleId, isAuthenticated, isOwner]);

  const loadReviews = async () => {
    setLoading(true);
    const result = await handleAsyncError(
      async () => await getVehicleReviews(vehicleId, { page, limit: 10 }),
      { showToast: false }
    );

    if (result) {
      setReviews(result.reviews);
      setStats(result.stats);
      setTotal(result.total);
      setHasMore(result.page * result.limit < result.total);
    }
    setLoading(false);
  };

  const loadUserReview = async () => {
    const result = await handleAsyncError(
      async () => await getUserReviewForVehicle(vehicleId),
      { showToast: false }
    );
    if (result) {
      setUserReview(result);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    loadReviews();
    loadUserReview();
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    const result = await handleAsyncError(
      async () => {
        await deleteReview(reviewId);
        return true;
      },
      { customMessage: 'Failed to delete review' }
    );

    if (result) {
      loadReviews();
      loadUserReview();
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  const loadMoreReviews = async () => {
    const result = await handleAsyncError(
      async () => await getVehicleReviews(vehicleId, { page: page + 1, limit: 10 }),
      { showToast: false }
    );

    if (result) {
      setReviews([...reviews, ...result.reviews]);
      setPage(page + 1);
      setHasMore(result.page * result.limit < result.total);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-[#111] mb-1">
                {stats.averageRating.toFixed(1)}
              </h3>
              <ReviewStars rating={stats.averageRating} size="lg" showNumber={false} />
              <p className="text-sm text-[#666] mt-2">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 min-w-[200px]">
                    <span className="text-sm text-[#666] w-8">{rating} star</span>
                    <div className="flex-1 h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ffb800] transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-[#666] w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User's Review */}
      {userReview && !editingReview && (
        <div className="bg-gradient-to-br from-[#10b981]/5 to-[#059669]/5 rounded-[20px] border border-[#10b981]/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-[#111]">Your Review</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(userReview)}
              className="text-[#10b981] hover:text-[#059669]"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <ReviewCard
            review={userReview}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={true}
          />
        </div>
      )}

      {/* Review Form */}
      {(showForm || editingReview) && (
        <ReviewForm
          vehicleId={vehicleId}
          existingReview={editingReview || undefined}
          onSuccess={handleReviewSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Write Review Button */}
      {canReview && !showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#111] text-white hover:bg-[#222] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Write a Review
        </Button>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#111]">
            Reviews ({total})
          </h3>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={review.userId === user?.id ? handleEdit : undefined}
              onDelete={review.userId === user?.id ? handleDelete : undefined}
              canEdit={review.userId === user?.id}
            />
          ))}

          {hasMore && (
            <Button
              variant="outline"
              onClick={loadMoreReviews}
              className="w-full border-[#e5e5e5] text-[#111] hover:bg-[#fafafa]"
            >
              Load More Reviews
            </Button>
          )}
        </div>
      ) : (
        !loading && (
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-8 text-center">
            <Star className="w-12 h-12 text-[#e5e5e5] mx-auto mb-4" />
            <p className="text-[#666]">No reviews yet. Be the first to review this vehicle!</p>
          </div>
        )
      )}
    </div>
  );
}

