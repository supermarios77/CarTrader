export class ReviewUserDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
}

export class ReviewResponseDto {
  id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: ReviewUserDto;
}

export class ReviewStatsDto {
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

export class ReviewListResponseDto {
  reviews: ReviewResponseDto[];
  stats: ReviewStatsDto;
  total: number;
  page: number;
  limit: number;
}

