import { useState, useEffect } from "react"
import { getMyProfile, updateMyProfile } from "@/api/profiles"
import type { Profile, UpdateProfileRequest } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Shield,
  Award,
  CheckCircle2,
  Calendar,
  Edit3,
  Save,
  X,
  Loader2,
  GraduationCap,
  Building2,
  BookOpen,
  Globe,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react"

// User Role Code mapping
const ROLE_NAMES: Record<number, { name: string; variant: "default" | "secondary" | "outline" | "destructive"; bgClass: string }> = {
  1: { name: "Guest", variant: "outline", bgClass: "border-muted-foreground/30 text-muted-foreground" },
  2: { name: "UCB Student", variant: "secondary", bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  3: { name: "Faculty / Teacher", variant: "default", bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  4: { name: "Moderator", variant: "default", bgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  5: { name: "Admin", variant: "destructive", bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
}

export function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    username: "",
    bio: "",
    avatarUrl: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    program: "",
    yearLevel: undefined,
  })

  // Load Profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setErrorMsg(null)
        const data = await getMyProfile()
        setProfile(data)
        initFormData(data)
      } catch (err: unknown) {
        console.error("Failed to load profile", err)
        setErrorMsg("Failed to load profile details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const initFormData = (data: Profile) => {
    setFormData({
      username: data.username || "",
      bio: data.bio || "",
      avatarUrl: data.avatarUrl || "",
      facebook: data.facebook || "",
      instagram: data.instagram || "",
      twitter: data.twitter || "",
      tiktok: data.tiktok || "",
      program: data.program || "",
      yearLevel: data.yearLevel ?? undefined,
    })
  }

  const handleStartEdit = () => {
    if (profile) {
      initFormData(profile)
    }
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (profile) {
      initFormData(profile)
    }
    setErrorMsg(null)
    setIsEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!formData.username.trim()) {
      setErrorMsg("Username cannot be empty.")
      return
    }

    try {
      setSaving(true)
      const updated = await updateMyProfile({
        ...formData,
        username: formData.username.trim(),
        bio: formData.bio ? formData.bio.trim() : null,
        avatarUrl: formData.avatarUrl ? formData.avatarUrl.trim() : null,
        facebook: formData.facebook ? formData.facebook.trim() : null,
        instagram: formData.instagram ? formData.instagram.trim() : null,
        twitter: formData.twitter ? formData.twitter.trim() : null,
        tiktok: formData.tiktok ? formData.tiktok.trim() : null,
        program: formData.program ? formData.program.trim() : null,
        yearLevel: formData.yearLevel ? Number(formData.yearLevel) : undefined,
      })

      setProfile(updated)
      setIsEditing(false)
      setSuccessMsg("Your profile was updated successfully!")
    } catch (err: any) {
      console.error("Failed to update profile", err)
      const msg = err.response?.data?.message || "Failed to save profile changes. Please try again."
      setErrorMsg(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading your profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Unable to view profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {errorMsg || "We couldn't retrieve your profile information."}
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Try Again
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
              <div className="relative group">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="size-28 sm:size-32 rounded-2xl object-cover ring-4 ring-card bg-muted shadow-md"
                    onError={(e) => {
                      // Fallback if image fails to load
                      ;(e.target as HTMLElement).style.display = "none"
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
                    <Mail className="size-3.5" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit / Action Button */}
            <div className="flex justify-center sm:justify-end">
              {!isEditing ? (
                <Button onClick={handleStartEdit} className="gap-2 font-medium shadow-sm">
                  <Edit3 className="size-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <Button variant="outline" onClick={handleCancelEdit} className="gap-2 font-medium">
                  <X className="size-4" />
                  <span>Cancel Editing</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats & Status Badges Strip */}
        <div className="border-t border-border bg-muted/30 px-6 py-3.5 sm:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            {/* Reputation */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
              <Award className="size-4" />
              <span>{profile.reputation} Reputation Points</span>
            </div>

            {/* Verified Student */}
            {profile.isVerifiedStudent && (
              <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                <CheckCircle2 className="size-4" />
                <span>Verified UCB Student</span>
              </div>
            )}

            {/* Verified Teacher */}
            {profile.isVerifiedTeacher && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                <Shield className="size-4" />
                <span>Verified Faculty Member</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="size-5 shrink-0" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Main Content Area: View or Edit Form */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Bio & Academic Info */}
          <div className="md:col-span-2 space-y-6">
            {/* About / Bio Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  <span>About Me</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {profile.bio}
                  </p>
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-sm border border-dashed rounded-lg bg-muted/20">
                    <p>No bio added yet.</p>
                    <button
                      onClick={handleStartEdit}
                      className="mt-1 text-xs text-primary hover:underline font-medium"
                    >
                      + Add a short bio
                    </button>
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
                        href={profile.tiktok.startsWith("http") ? profile.tiktok : `https://tiktok.com/@${profile.tiktok.replace('@','')}`}
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
                    No social profiles linked.
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
                  <span className="text-muted-foreground">Role Code</span>
                  <span className="font-mono font-medium">{profile.userRoleCode} ({roleMeta.name})</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Edit Profile Form Card */
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Edit3 className="size-5 text-primary" />
              <span>Edit Your Profile</span>
            </CardTitle>
            <CardDescription>
              Update your public profile details, social media links, and bio visible to the UCB Forum community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                  Basic Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-semibold">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      maxLength={255}
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. jdoe_ucb"
                    />
                  </div>

                  {/* Avatar URL */}
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl" className="text-xs font-semibold">
                      Avatar Image URL
                    </Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      maxLength={2048}
                      value={formData.avatarUrl || ""}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="bio" className="text-xs font-semibold">
                      Bio / Short Description
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {(formData.bio || "").length} / 500
                    </span>
                  </div>
                  <textarea
                    id="bio"
                    rows={3}
                    maxLength={500}
                    value={formData.bio || ""}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell the campus community about yourself..."
                    className="w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Academic Details (If Student) */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center justify-between">
                  <span>Academic Details</span>
                  {profile.isVerifiedStudent && (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500">
                      Editable for Verified Students
                    </Badge>
                  )}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Program */}
                  <div className="space-y-2">
                    <Label htmlFor="program" className="text-xs font-semibold">
                      Program / Degree
                    </Label>
                    <Input
                      id="program"
                      type="text"
                      maxLength={100}
                      value={formData.program || ""}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      placeholder="e.g. BS Information Technology"
                    />
                  </div>

                  {/* Year Level */}
                  <div className="space-y-2">
                    <Label htmlFor="yearLevel" className="text-xs font-semibold">
                      Year Level
                    </Label>
                    <Input
                      id="yearLevel"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.yearLevel ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearLevel: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="e.g. 4"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                  Social Media Handles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-xs font-semibold">
                      Facebook Username / Link
                    </Label>
                    <Input
                      id="facebook"
                      type="text"
                      maxLength={100}
                      value={formData.facebook || ""}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      placeholder="e.g. charlestinoy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-xs font-semibold">
                      Instagram Username
                    </Label>
                    <Input
                      id="instagram"
                      type="text"
                      maxLength={100}
                      value={formData.instagram || ""}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="e.g. charlestinoy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-xs font-semibold">
                      Twitter / X Username
                    </Label>
                    <Input
                      id="twitter"
                      type="text"
                      maxLength={100}
                      value={formData.twitter || ""}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="e.g. charlestinoy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="text-xs font-semibold">
                      TikTok Username
                    </Label>
                    <Input
                      id="tiktok"
                      type="text"
                      maxLength={100}
                      value={formData.tiktok || ""}
                      onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                      placeholder="e.g. charlestinoy"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="gap-2 min-w-[130px]">
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
