export const IS_PUBLIC_KEY = 'isPublic';

export interface UserPayload {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  permissions: string[];
}

export interface TokenResponse {
  token: string;
  expiresAt: Date;
}
