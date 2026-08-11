import apiClient from "@/api/client"
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types"

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
