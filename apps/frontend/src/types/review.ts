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

