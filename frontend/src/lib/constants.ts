export const AUTH_TOKEN_KEY = "ucb_forum_token"

export const USER_ROLE = {
  Guest: 1,
  Student: 2,
  Teacher: 3,
  Moderator: 4,
  Admin: 5,
} as const

export function isModeratorOrAdmin(roleCode: number | null | undefined): boolean {
  return roleCode === USER_ROLE.Moderator || roleCode === USER_ROLE.Admin
}

/** Matches PostsController: only mods/admins may mutate posts when posting is disabled. */
export function canMutatePostsInCategory(
  isPostingAllowed: boolean | null | undefined,
  roleCode: number | null | undefined,
): boolean {
  return isPostingAllowed !== false || isModeratorOrAdmin(roleCode)
}
