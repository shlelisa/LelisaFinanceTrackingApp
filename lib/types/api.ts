export interface UserPreferences {
  currency?: string;
  language?: string;
  theme?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: "admin" | "user";
  preferences?: UserPreferences;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
