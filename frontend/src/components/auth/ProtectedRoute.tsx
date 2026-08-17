import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

/**
 * Authenticated app routes. Banned users are redirected to /banned and cannot
 * reach any protected page.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isBanned } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isBanned) {
    return <Navigate to="/banned" replace />
  }

  return <Outlet />
}
