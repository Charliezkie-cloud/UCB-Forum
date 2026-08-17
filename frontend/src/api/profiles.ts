import apiClient from "@/api/client"
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  BanUserRequest,
  UserBanResponse,
} from "@/types"

export async function getMyProfile(): Promise<Profile> {
  const response = await apiClient.get<Profile>("/profiles/me")
  return response.data
}

export async function getProfileByUserId(userId: number): Promise<Profile> {
  const response = await apiClient.get<Profile>(`/profiles/user/${userId}`)
  return response.data
}

export async function getProfileByUsername(username: string): Promise<Profile> {
  const response = await apiClient.get<Profile>(`/profiles/username/${encodeURIComponent(username)}`)
  return response.data
}

export async function updateMyProfile(payload: UpdateProfileRequest): Promise<Profile> {
  const response = await apiClient.put<Profile>("/profiles/me", payload)
  return response.data
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  await apiClient.put("/profiles/me/password", payload)
}

export async function deleteMyAccount(payload: DeleteAccountRequest): Promise<void> {
  await apiClient.delete("/profiles/me", { data: payload })
}

export async function banUser(userId: number, payload: BanUserRequest): Promise<UserBanResponse> {
  const response = await apiClient.post<UserBanResponse>(`/profiles/${userId}/ban`, payload)
  return response.data
}

export async function getUserBanStatus(userId: number): Promise<UserBanResponse> {
  const response = await apiClient.get<UserBanResponse>(`/profiles/${userId}/ban`)
  return response.data
}

export { addReputation, removeReputation } from "@/api/reputations"


