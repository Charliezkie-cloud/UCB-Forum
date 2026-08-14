import apiClient from "@/api/client"
import type { ReputationResponse, GiveReputationRequest } from "@/types"

export async function getReputationStatus(userId: number): Promise<ReputationResponse> {
  const response = await apiClient.get<ReputationResponse>(`/reputations/user/${userId}`)
  return response.data
}

export async function giveReputation(
  userId: number,
  isPositive: boolean = true
): Promise<ReputationResponse> {
  const payload: GiveReputationRequest = { isPositive }
  const response = await apiClient.post<ReputationResponse>(`/reputations/user/${userId}`, payload)
  return response.data
}

export async function addReputation(userId: number): Promise<ReputationResponse> {
  const response = await apiClient.post<ReputationResponse>(`/reputations/user/${userId}/add`)
  return response.data
}

export async function downvoteReputation(userId: number): Promise<ReputationResponse> {
  const response = await apiClient.post<ReputationResponse>(`/reputations/user/${userId}/remove`)
  return response.data
}

export async function removeReputation(userId: number): Promise<ReputationResponse> {
  const response = await apiClient.delete<ReputationResponse>(`/reputations/user/${userId}`)
  return response.data
}
