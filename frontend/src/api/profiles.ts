import apiClient from "@/api/client"
import type { Profile, UpdateProfileRequest } from "@/types"

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

export { addReputation, removeReputation } from "@/api/reputations"

