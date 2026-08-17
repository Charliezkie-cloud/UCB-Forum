import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldBan, Clock, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import type { UserBanResponse } from "@/types"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function BanPage() {
  const { activeBan, isBanned, logout, refreshBanStatus } = useAuth()
  const navigate = useNavigate()
  const [ban, setBan] = useState<UserBanResponse | null>(activeBan)
  const [ready, setReady] = useState(Boolean(activeBan) || isBanned)

  useEffect(() => {
    let cancelled = false

    async function syncBan() {
      if (activeBan) {
        setBan(activeBan)
        setReady(true)
        return
      }

      const stillBanned = await refreshBanStatus()
      if (cancelled) return

      if (!stillBanned) {
        navigate("/", { replace: true })
        return
      }

      setReady(true)
    }

    void syncBan()

    return () => {
      cancelled = true
    }
  }, [activeBan, refreshBanStatus, navigate])

  useEffect(() => {
    if (activeBan) {
      setBan(activeBan)
      setReady(true)
    }
  }, [activeBan])

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  const isPermanent = ban ? ban.expiresAt === null : true
  const reason = ban?.reason?.trim()
    ? ban.reason
    : "Your account has been suspended by a moderator or administrator."

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldBan className="size-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Your account has been suspended
            </h1>
            <p className="text-sm text-muted-foreground">
              You are not allowed to access the UCB Forum right now.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card shadow-sm divide-y divide-border/60">
          <div className="flex gap-3 p-4">
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Reason
              </p>
              <p className="text-sm leading-snug">{reason}</p>
            </div>
          </div>

          <div className="flex gap-3 p-4">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {isPermanent ? "Duration" : "Expires at"}
              </p>
              <p className="text-sm leading-snug">
                {isPermanent || !ban?.expiresAt ? (
                  <span className="font-medium text-destructive">Permanent ban</span>
                ) : (
                  formatDate(ban.expiresAt)
                )}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          If you believe this is a mistake, please contact a forum moderator or administrator.
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
