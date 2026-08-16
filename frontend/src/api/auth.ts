import apiClient from "@/api/client"
import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types"

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload)
  return data
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload)
  return data
}

export async function getCurrentUser(): Promise<AuthResponse["user"]> {
  const { data } = await apiClient.get<AuthResponse["user"]>("/auth/me")
  return data
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const { data } = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", payload)
  return data
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/reset-password", payload)
  return data
}
