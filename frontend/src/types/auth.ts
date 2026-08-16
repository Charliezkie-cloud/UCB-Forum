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

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  resetToken: string
  expiresAt: string
  message: string
}

export interface ResetPasswordRequest {
  resetToken: string
  newPassword: string
  confirmNewPassword: string
}
