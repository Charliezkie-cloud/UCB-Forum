import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

/**
 * Ban page only. Requires an authenticated user with an ongoing ban.
 * Non-banned users go home; unauthenticated users go to login.
 */
export function BannedRoute() {
  const { isAuthenticated, isLoading, isBanned } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isBanned) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
