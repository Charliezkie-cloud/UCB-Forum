import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProfileByUserId } from "@/api/profiles"
import { getReputationStatus, addReputation, downvoteReputation, removeReputation } from "@/api/reputations"
import type { Profile, ReputationResponse } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Shield,
  Award,
  CheckCircle2,
  Calendar,
  Loader2,
  GraduationCap,
  Building2,
  BookOpen,
  Globe,
  MessageSquare,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react"

const ROLE_NAMES: Record<number, { name: string; bgClass: string }> = {
  1: { name: "Guest", bgClass: "border-muted-foreground/30 text-muted-foreground" },
  2: { name: "Student", bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  3: { name: "Faculty / Teacher", bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  4: { name: "Moderator", bgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  5: { name: "Admin", bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [repStatus, setRepStatus] = useState<ReputationResponse | null>(null)
  const [repLoading, setRepLoading] = useState(false)
  const [repActionLoading, setRepActionLoading] = useState(false)
  const [repError, setRepError] = useState<string | null>(null)
  const [repDialogOpen, setRepDialogOpen] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const parsedId = userId ? parseInt(userId, 10) : NaN
      if (isNaN(parsedId)) {
        setErrorMsg("Invalid user ID.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setErrorMsg(null)
        const data = await getProfileByUserId(parsedId)
        setProfile(data)
      } catch (err: unknown) {
        console.error("Failed to load user profile", err)
        setErrorMsg("This profile could not be found or is no longer available.")
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [userId])

  // Guests (roleCode 1) cannot vote on reputation; owners cannot vote on themselves.
  const targetUserId = userId ? parseInt(userId, 10) : NaN
  const canVote =
    authUser !== null &&
    authUser.userRoleCode !== 1 &&
    authUser.userId !== targetUserId

  const loadRepStatus = useCallback(async () => {
    if (!canVote || isNaN(targetUserId)) return
    try {
      setRepLoading(true)
      const data = await getReputationStatus(targetUserId)
      setRepStatus(data)
    } catch {
      // Non-critical — silently fail
    } finally {
      setRepLoading(false)
    }
  }, [canVote, targetUserId])

  useEffect(() => {
    void loadRepStatus()
  }, [loadRepStatus])

  const handleRepAction = async (action: "upvote" | "downvote" | "remove") => {
    if (!canVote || isNaN(targetUserId)) return
    setRepActionLoading(true)
    setRepError(null)
    try {
      let updated: ReputationResponse
      if (action === "upvote") updated = await addReputation(targetUserId)
      else if (action === "downvote") updated = await downvoteReputation(targetUserId)
      else updated = await removeReputation(targetUserId)
      setRepStatus(updated)
      setProfile((prev) => prev ? { ...prev, reputation: updated.reputation } : prev)
      setRepDialogOpen(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setRepError(axiosErr.response?.data?.message ?? "Something went wrong. Please try again.")
    } finally {
      setRepActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading profile…</p>
      </div>
    )
  }

  if (!profile || errorMsg) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Profile not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {errorMsg || "We couldn't load this profile. Try again in a moment."}
        </p>
        <Button className="mt-6" variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const roleMeta = ROLE_NAMES[profile.userRoleCode] || ROLE_NAMES[1]
  const joinedDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const userInitial = profile.username ? profile.username.charAt(0).toUpperCase() : "U"

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>

      {/* Top Banner & Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Cover Graphic Header */}
        <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        </div>

        {/* Profile Info Bar */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar & User Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="size-28 sm:size-32 rounded-2xl object-cover ring-4 ring-card bg-muted shadow-md"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : null}
                {(!profile.avatarUrl || true) && (
                  <div
                    className={`${
                      profile.avatarUrl ? "hidden" : "flex"
                    } size-28 sm:size-32 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-heading text-4xl font-bold ring-4 ring-card shadow-md`}
                  >
                    {userInitial}
                  </div>
                )}
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {profile.username}
                  </h1>
                  <Badge variant="outline" className={`border ${roleMeta.bgClass} font-medium text-xs`}>
                    {roleMeta.name}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Status Badges Strip */}
        <div className="border-t border-border bg-muted/30 px-6 py-3.5 sm:px-8 flex flex-wrap items-center gap-4">
          {/* Reputation */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-medium">
            <Award className="size-4" />
            <span>{profile.reputation} Reputation Points</span>
          </div>

          {/* Reputation Action Button — hidden from Guests and profile owner */}
          {canVote && (
            <Dialog open={repDialogOpen} onOpenChange={(open) => { setRepDialogOpen(open); if (!open) setRepError(null) }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full text-xs gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  disabled={repLoading}
                >
                  {repLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : repStatus?.hasVoted ? (
                    <>
                      {repStatus.isPositive ? <ThumbsUp className="size-3.5" /> : <ThumbsDown className="size-3.5" />}
                      Change Vote
                    </>
                  ) : (
                    <>
                      <Award className="size-3.5" />
                      Rate Reputation
                    </>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Award className="size-5 text-amber-500" />
                    Rate {profile.username}&apos;s Reputation
                  </DialogTitle>
                  <DialogDescription>
                    Your vote affects their reputation score on the forum. You can change or retract it any time.
                  </DialogDescription>
                </DialogHeader>

                {repError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                    <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                    <span>{repError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 py-1">
                  {/* Upvote */}
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-12 border-green-500/30 hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50 dark:hover:text-green-400"
                    onClick={() => void handleRepAction("upvote")}
                    disabled={repActionLoading || (repStatus?.hasVoted && repStatus.isPositive === true)}
                  >
                    {repActionLoading ? <Loader2 className="size-4 animate-spin" /> : <ThumbsUp className="size-4 text-green-500" />}
                    <div className="text-left">
                      <p className="text-sm font-medium">Upvote</p>
                      <p className="text-xs text-muted-foreground">This member contributed positively to the community.</p>
                    </div>
                  </Button>

                  {/* Downvote */}
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-12 border-red-500/30 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50 dark:hover:text-red-400"
                    onClick={() => void handleRepAction("downvote")}
                    disabled={repActionLoading || (repStatus?.hasVoted && repStatus.isPositive === false)}
                  >
                    {repActionLoading ? <Loader2 className="size-4 animate-spin" /> : <ThumbsDown className="size-4 text-red-500" />}
                    <div className="text-left">
                      <p className="text-sm font-medium">Downvote</p>
                      <p className="text-xs text-muted-foreground">This member's behavior was unhelpful or disruptive.</p>
                    </div>
                  </Button>

                  {/* Revoke — only visible if already voted */}
                  {repStatus?.hasVoted && (
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-muted-foreground hover:text-foreground"
                      onClick={() => void handleRepAction("remove")}
                      disabled={repActionLoading}
                    >
                      {repActionLoading ? <Loader2 className="size-4 animate-spin" /> : <Minus className="size-4" />}
                      <div className="text-left">
                        <p className="text-sm font-medium">Revoke Vote</p>
                        <p className="text-xs text-muted-foreground">Take back your reputation vote.</p>
                      </div>
                    </Button>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="ghost" size="sm" onClick={() => { setRepDialogOpen(false); setRepError(null) }}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {profile.isVerifiedStudent && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-xs font-medium">
              <CheckCircle2 className="size-4" />
              <span>Verified Student</span>
            </div>
          )}

          {profile.isVerifiedTeacher && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-xs font-medium">
              <Shield className="size-4" />
              <span>Verified Faculty Member</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Bio & Academic Info */}
        <div className="md:col-span-2 space-y-6">
          {/* About / Bio Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <span>About</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <div className="py-6 text-center text-muted-foreground text-sm border border-dashed rounded-lg bg-muted/20">
                  <p>This member hasn't written a bio yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span>Academic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border bg-card p-3.5 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <BookOpen className="size-3.5" /> Program / Course
                  </span>
                  <p className="font-semibold text-foreground">
                    {profile.program || "Not specified"}
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-3.5 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Year Level
                  </span>
                  <p className="font-semibold text-foreground">
                    {profile.yearLevel ? `${profile.yearLevel}th Year` : "Not specified"}
                  </p>
                </div>

                {profile.department && (
                  <div className="sm:col-span-2 rounded-lg border bg-card p-3.5 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      <Building2 className="size-3.5" /> Department
                    </span>
                    <p className="font-semibold text-foreground">{profile.department}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Social Links & Account Details */}
        <div className="space-y-6">
          {/* Social Accounts Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <span>Social Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.facebook || profile.instagram || profile.twitter || profile.tiktok ? (
                <div className="space-y-2 text-sm">
                  {profile.facebook && (
                    <a
                      href={profile.facebook.startsWith("http") ? profile.facebook : `https://facebook.com/${profile.facebook}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Facebook</span>
                      <span className="text-xs font-semibold text-primary truncate max-w-[150px]">{profile.facebook}</span>
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={profile.instagram.startsWith("http") ? profile.instagram : `https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Instagram</span>
                      <span className="text-xs font-semibold text-primary truncate max-w-[150px]">{profile.instagram}</span>
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={profile.twitter.startsWith("http") ? profile.twitter : `https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Twitter / X</span>
                      <span className="text-xs font-semibold text-primary truncate max-w-[150px]">{profile.twitter}</span>
                    </a>
                  )}
                  {profile.tiktok && (
                    <a
                      href={profile.tiktok.startsWith("http") ? profile.tiktok : `https://tiktok.com/@${profile.tiktok.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">TikTok</span>
                      <span className="text-xs font-semibold text-primary truncate max-w-[150px]">{profile.tiktok}</span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No social profiles linked yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Account Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono font-medium">{profile.userId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Profile ID</span>
                <span className="font-mono font-medium">{profile.profileId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{roleMeta.name}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">{joinedDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
