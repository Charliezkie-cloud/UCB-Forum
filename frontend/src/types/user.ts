export type UserRoleCode = 1 | 2 | 3 | 4 | 5

export interface User {
  userId: number
  email: string
  userRoleCode: UserRoleCode
  createdAt: string
}

export interface Profile {
  profileId: number
  userId: number
  email: string
  userRoleCode: number
  createdAt: string
  updatedAt: string
  username: string
  bio: string | null
  avatarUrl: string | null
  facebook: string | null
  instagram: string | null
  twitter: string | null
  tiktok: string | null
  isVerifiedStudent: boolean
  program: string | null
  yearLevel: number | null
  isVerifiedTeacher: boolean
  department: string | null
  reputation: number
}

export interface UpdateProfileRequest {
  username: string
  bio?: string | null
  avatarUrl?: string | null
  facebook?: string | null
  instagram?: string | null
  twitter?: string | null
  tiktok?: string | null
  program?: string | null
  yearLevel?: number | null
}

export interface PagedProfilesResponse {
  items: Profile[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ReputationResponse {
  targetUserId: number
  reputation: number
  hasVoted: boolean
  isPositive: boolean | null
}

export interface GiveReputationRequest {
  isPositive: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

