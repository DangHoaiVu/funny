export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserAuth {
  username: string;
  fullName?: string;
  email?: string;
  roles: string[];
  token: string;
}
