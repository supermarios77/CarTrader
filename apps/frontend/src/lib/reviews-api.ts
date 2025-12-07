import { api } from './api-client';

export interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatar: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export interface ReviewListResponse {
  reviews: Review[];
  stats: ReviewStats;
  total: number;
  page: number;
  limit: number;
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  minRating?: number;
}

/**
 * Create a review for a vehicle
 */
export async function createReview(
  vehicleId: string,
  data: CreateReviewData,
): Promise<Review> {
  return api.post<Review>(`/reviews/vehicles/${vehicleId}`, data);
}

/**
 * Get reviews for a vehicle
 */
export async function getVehicleReviews(
  vehicleId: string,
  params?: GetReviewsParams,
): Promise<ReviewListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.minRating) queryParams.append('minRating', String(params.minRating));

  const query = queryParams.toString();
  return api.get<ReviewListResponse>(`/reviews/vehicles/${vehicleId}${query ? `?${query}` : ''}`);
}

/**
 * Get review statistics for a vehicle
 */
export async function getVehicleReviewStats(vehicleId: string): Promise<ReviewStats> {
  return api.get<ReviewStats>(`/reviews/vehicles/${vehicleId}/stats`);
}

/**
 * Get seller rating statistics
 */
export async function getSellerRatingStats(sellerId: string): Promise<ReviewStats> {
  return api.get<ReviewStats>(`/reviews/sellers/${sellerId}/stats`);
}

/**
 * Get user's review for a vehicle (if exists)
 */
export async function getUserReviewForVehicle(vehicleId: string): Promise<Review | null> {
  try {
    const response = await api.get<Review | { message: string }>(`/reviews/vehicles/${vehicleId}/my-review`);
    if ('message' in response) {
      return null;
    }
    return response;
  } catch {
    return null;
  }
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  data: UpdateReviewData,
): Promise<Review> {
  return api.put<Review>(`/reviews/${reviewId}`, data);
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  return api.delete<void>(`/reviews/${reviewId}`);
}

