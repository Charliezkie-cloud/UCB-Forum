import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FolderTree,
  GraduationCap,
  Heart,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react"
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/api/notifications"
import { searchAll } from "@/api/search"
import { CategoryLucideIcon } from "@/components/categories/CategoryLucideIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import type { NotificationResponse, SearchResultsResponse } from "@/types"
import { NotificationType } from "@/types"

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}



export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<SearchResultsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const notificationsContainerRef = useRef<HTMLDivElement>(null)
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  // Derive display name & initial
  const userDisplayName = user?.email ? user.email.split("@")[0] : "Guest User"
  const userInitial = userDisplayName.charAt(0).toUpperCase()

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    try {
      setNotificationsLoading(true)
      const data = await getNotifications({ page: 1, pageSize: 20 })
      setNotifications(data.items)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Poll notifications when logged in
  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  const toggleNotifications = () => {
    const nextState = !isNotificationsOpen
    setIsNotificationsOpen(nextState)
    if (nextState) {
      setIsMobileSearchOpen(false)
      if (user) {
        fetchNotifications()
      }
    }
  }

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.notificationId)
        setNotifications((prev) =>
          prev.map((item) =>
            item.notificationId === notification.notificationId
              ? { ...item, isRead: true }
              : item
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    }

    setIsNotificationsOpen(false)

    if (notification.relatedPostId) {
      navigate(`/posts/${notification.relatedPostId}`)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAllRead) return
    try {
      setMarkingAllRead(true)
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  // Debounce user input

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  // Execute live search
  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null)
      setLoading(false)
      return
    }

    const abortController = new AbortController()
    setLoading(true)

    searchAll(debouncedQuery, 4, abortController.signal)
      .then((data) => {
        setResults(data)
      })
      .catch((error) => {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          setResults(null)
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      abortController.abort()
    }
  }, [debouncedQuery])

  // Global shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true)
          setTimeout(() => mobileInputRef.current?.focus(), 100)
        } else {
          desktopInputRef.current?.focus()
          setIsOpen(true)
        }
      }

      if (event.key === "Escape") {
        setIsOpen(false)
        setIsMobileSearchOpen(false)
        setIsNotificationsOpen(false)
        desktopInputRef.current?.blur()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
      if (
        notificationsContainerRef.current &&
        !notificationsContainerRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setIsOpen(false)
    setIsMobileSearchOpen(false)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleItemSelect = (path: string) => {
    setIsOpen(false)
    setIsMobileSearchOpen(false)
    setQuery("")
    navigate(path)
  }

  const totalResultsCount =
    (results?.posts.length ?? 0) +
    (results?.categories.length ?? 0) +
    (results?.profiles.length ?? 0)

  const hasAnyResults = totalResultsCount > 0

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold tracking-tight text-foreground leading-none sm:text-base">
                University of Cebu
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Banilad Campus <span className="text-primary font-semibold normal-case">Forum</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Search Bar & Dropdown */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex flex-1 max-w-lg items-center relative"
        >
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={desktopInputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => {
                if (query.trim()) setIsOpen(true)
              }}
              placeholder="Search posts, categories, or members..."
              className="pl-9 pr-16 h-9 bg-muted/40 text-sm border-border/80 focus-visible:bg-background transition-colors"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setResults(null)
                  setIsOpen(false)
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ⌘K
            </kbd>
          </form>

          {/* Search Dropdown Popup */}
          {isOpen && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="max-h-[70vh] overflow-y-auto divide-y divide-border/60">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    Searching across campus forum...
                  </div>
                ) : !hasAnyResults ? (
                  <div className="py-8 text-center px-4">
                    <Search className="mx-auto mb-2 size-6 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-foreground">No matches found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      We couldn't find anything matching &quot;{debouncedQuery}&quot;.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Categories Group */}
                    {results?.categories && results.categories.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <FolderTree className="size-3 text-primary" />
                          <span>Categories ({results.categories.length})</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {results.categories.map((cat) => (
                            <button
                              key={cat.categoryId}
                              type="button"
                              onClick={() => handleItemSelect(`/categories/${cat.slug}`)}
                              className="w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted/60 transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                  <CategoryLucideIcon
                                    iconClass={cat.iconClass}
                                    className="size-3.5"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                    {cat.name}
                                  </p>
                                  {cat.description && (
                                    <p className="text-[11px] text-muted-foreground truncate max-w-sm">
                                      {cat.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {cat.isRestricted && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 px-1.5 h-4 gap-1 text-muted-foreground"
                                >
                                  <Lock className="size-2.5" />
                                  Restricted
                                </Badge>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discussions / Posts Group */}
                    {results?.posts && results.posts.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <MessageSquare className="size-3 text-primary" />
                          <span>Discussions ({results.posts.length})</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {results.posts.map((post) => (
                            <button
                              key={post.postId}
                              type="button"
                              onClick={() => handleItemSelect(`/posts/${post.postId}`)}
                              className="w-full flex items-start justify-between gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-muted/60 transition-colors group"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {post.title || "Untitled Discussion"}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {post.categoryName && (
                                    <span className="font-medium text-foreground/80">
                                      {post.categoryName} ·{" "}
                                    </span>
                                  )}
                                  by {post.authorUsername}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-0.5">
                                  <Heart className="size-3 text-destructive" />
                                  {post.likesCount}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <MessageSquare className="size-3" />
                                  {post.replyCount}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members Group */}
                    {results?.profiles && results.profiles.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <Users className="size-3 text-primary" />
                          <span>Members ({results.profiles.length})</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {results.profiles.map((prof) => (
                            <button
                              key={prof.profileId}
                              type="button"
                              onClick={() =>
                                handleItemSelect(
                                  user?.userId === prof.userId
                                    ? "/profile"
                                    : `/users/${prof.userId}`,
                                )
                              }
                              className="w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-muted/60 transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                  {prof.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                      {prof.username}
                                    </span>
                                    {prof.isVerifiedStudent && (
                                      <CheckCircle2 className="size-3 text-blue-500 shrink-0" />
                                    )}
                                    {prof.isVerifiedTeacher && (
                                      <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {prof.isVerifiedTeacher
                                      ? prof.department || "Faculty Member"
                                      : prof.isVerifiedStudent
                                        ? prof.program || "Student"
                                        : "Forum Member"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {prof.reputation} rep
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* View all results footer */}
              {query.trim() && (
                <div className="p-2 bg-muted/40 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Press <kbd className="font-mono text-[10px] bg-background px-1 py-0.5 rounded border">Enter</kbd> to see full results
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearchSubmit()}
                    className="text-xs font-semibold text-primary hover:text-primary/90 h-7"
                  >
                    View all results
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => {
              setIsMobileSearchOpen(!isMobileSearchOpen)
              setIsNotificationsOpen(false)
              if (!isMobileSearchOpen) {
                setTimeout(() => mobileInputRef.current?.focus(), 100)
              }
            }}
            title="Search"
          >
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </Button>

          <Button
            size="sm"
            asChild
            className="hidden sm:flex gap-1.5 font-medium shadow-sm"
          >
            <Link to="/categories">
              <Plus className="size-4" />
              <span>Create Post</span>
            </Link>
          </Button>

          {/* Notifications Dropdown Container */}
          <div ref={notificationsContainerRef} className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleNotifications}
              className="relative text-muted-foreground hover:text-foreground"
              title="Notifications"
            >
              <Bell className="size-4" />
              {user && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in-50">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Notifications Dropdown Menu */}
            {isNotificationsOpen && (
              <div className="fixed inset-x-2 top-[68px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 z-50 w-auto sm:w-96 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl sm:shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-semibold text-foreground">Notifications</span>
                    {user && unreadCount > 0 && (
                      <Badge variant="secondary" className="text-[11px] px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {user && unreadCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead}
                      className="text-xs h-7 text-primary hover:text-primary/80 hover:bg-primary/10 gap-1 px-2"
                    >
                      {markingAllRead ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <CheckCheck className="size-3.5" />
                      )}
                      <span>Mark all as read</span>
                    </Button>
                  )}
                </div>

                {/* Body */}
                <div className="max-h-[calc(100vh-140px)] sm:max-h-[360px] overflow-y-auto divide-y divide-border/50">
                  {!user ? (
                    <div className="p-6 text-center">
                      <Bell className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm font-semibold text-foreground">Sign in to view notifications</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Get real-time updates when someone replies to your post or likes your contribution.
                      </p>
                      <Button size="sm" asChild className="w-full">
                        <Link to="/login" onClick={() => setIsNotificationsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                    </div>
                  ) : notificationsLoading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                      <Loader2 className="size-5 animate-spin text-primary" />
                      <span className="text-xs font-medium">Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-10 text-center px-4">
                      <CheckCircle2 className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                      <p className="text-sm font-semibold text-foreground">You're all caught up!</p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-xs mx-auto">
                        No new notifications right now. Check back later for replies and community activity.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !n.isRead
                      return (
                        <button
                          key={n.notificationId}
                          type="button"
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/60 relative group ${
                            isUnread ? "bg-primary/5 font-medium" : "bg-transparent"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border ${
                              n.type === NotificationType.Reply
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : n.type === NotificationType.Like
                                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                  : n.type === NotificationType.Reputation
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {n.type === NotificationType.Reply ? (
                              <MessageSquare className="size-3.5" />
                            ) : n.type === NotificationType.Like ? (
                              <Heart className="size-3.5" />
                            ) : n.type === NotificationType.Reputation ? (
                              <TrendingUp className="size-3.5" />
                            ) : (
                              <Bell className="size-3.5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-foreground leading-snug break-words">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>

                          {isUnread && (
                            <span className="size-2 shrink-0 rounded-full bg-primary mt-1.5" title="Unread" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>


          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border/80">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-muted/60 transition-colors group"
                title="View My Profile"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 group-hover:scale-105 transition-transform">
                  {userInitial}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </Link>

              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                title="My Profile"
                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                <Link to="/profile">
                  <User className="size-4" />
                  <span className="sr-only">My Profile</span>
                </Link>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Log out"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
              >
                <LogOut className="size-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-border px-4 py-3 bg-background animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={mobileInputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              placeholder="Search posts, categories, members..."
              className="pl-9 pr-8 h-9 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setResults(null)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              >
                <X className="size-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Quick Dropdown */}
          {isOpen && query.trim() && (
            <div className="mt-2 rounded-lg border border-border bg-card shadow-sm divide-y divide-border/60 max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  Searching...
                </div>
              ) : !hasAnyResults ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No matches found for &quot;{debouncedQuery}&quot;
                </p>
              ) : (
                <>
                  {results?.categories?.map((cat) => (
                    <button
                      key={cat.categoryId}
                      type="button"
                      onClick={() => handleItemSelect(`/categories/${cat.slug}`)}
                      className="w-full flex items-center gap-2 p-2.5 text-left text-xs hover:bg-muted/50"
                    >
                      <FolderTree className="size-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground truncate">{cat.name}</span>
                    </button>
                  ))}
                  {results?.posts?.map((post) => (
                    <button
                      key={post.postId}
                      type="button"
                      onClick={() => handleItemSelect(`/posts/${post.postId}`)}
                      className="w-full flex flex-col gap-0.5 p-2.5 text-left text-xs hover:bg-muted/50"
                    >
                      <span className="font-semibold text-foreground truncate">
                        {post.title || "Untitled Discussion"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        in {post.categoryName} by {post.authorUsername}
                      </span>
                    </button>
                  ))}
                  {results?.profiles?.map((prof) => (
                    <button
                      key={prof.profileId}
                      type="button"
                      onClick={() =>
                        handleItemSelect(
                          user?.userId === prof.userId
                            ? "/profile"
                            : `/users/${prof.userId}`,
                        )
                      }
                      className="w-full flex items-center gap-2 p-2.5 text-left text-xs hover:bg-muted/50"
                    >
                      <User className="size-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">{prof.username}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full p-2 text-center text-xs font-semibold text-primary hover:bg-muted/50"
                  >
                    View all results →
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
