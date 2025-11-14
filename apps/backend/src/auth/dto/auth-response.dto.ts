export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    emailVerified: boolean;
  };
}

