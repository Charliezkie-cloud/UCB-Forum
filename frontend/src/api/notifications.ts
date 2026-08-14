import apiClient from "@/api/client"
import type {
  GetNotificationsParams,
  PagedNotificationsResponse,
} from "@/types"

export async function getNotifications(
  params: GetNotificationsParams = {},
): Promise<PagedNotificationsResponse> {
  const response = await apiClient.get<PagedNotificationsResponse>("/notifications", {
    params: {
      unreadOnly: params.unreadOnly,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  })
  return response.data
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`)
}

export async function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  const response = await apiClient.patch<{ updatedCount: number }>("/notifications/read-all")
  return response.data
}
