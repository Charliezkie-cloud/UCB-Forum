import type { User } from "@/types/user"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  username: string
}

export interface AuthResponse {
  token: string
  user: User
}
