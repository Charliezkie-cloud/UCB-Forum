import apiClient from "@/api/client"
import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
  UserRoleCode,
} from "@/types"

/** Flat shape returned by the ASP.NET AuthController. */
interface ServerAuthPayload {
  token: string
  expiresAt?: string
  userId: number
  email: string
  userRoleCode: number
}

interface ServerMePayload {
  authenticated?: boolean
  userId: number
  email: string
  userRoleCode: number
}

function toUser(payload: {
  userId: number
  email: string
  userRoleCode: number
  createdAt?: string
}): User {
  return {
    userId: payload.userId,
    email: payload.email,
    userRoleCode: payload.userRoleCode as UserRoleCode,
    createdAt: payload.createdAt ?? "",
  }
}

function toAuthResponse(payload: ServerAuthPayload): AuthResponse {
  return {
    token: payload.token,
    user: toUser(payload),
  }
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ServerAuthPayload>("/auth/login", payload)
  return toAuthResponse(data)
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ServerAuthPayload>("/auth/register", payload)
  return toAuthResponse(data)
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<ServerMePayload>("/auth/me")
  return toUser(data)
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const { data } = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", payload)
  return data
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/reset-password", payload)
  return data
}
