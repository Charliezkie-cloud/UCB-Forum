export const NotificationType = {
  Reply: 1,
  Like: 2,
  Reputation: 3,
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export interface NotificationResponse {
  notificationId: number
  userId: number
  relatedPostId: number | null
  createdAt: string
  type: number
  message: string
  isRead: boolean
}

export interface PagedNotificationsResponse {
  items: NotificationResponse[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  unreadCount: number
}

export interface GetNotificationsParams {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}
