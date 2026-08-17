import type { UserBanResponse } from "@/types"

/** True when the ban is active and not past its expiration (null expiresAt = permanent). */
export function isBanOngoing(ban: UserBanResponse | null | undefined): boolean {
  if (!ban || !ban.isActive) return false
  if (ban.expiresAt === null) return true
  return new Date(ban.expiresAt) > new Date()
}
