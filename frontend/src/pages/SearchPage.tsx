import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  CheckCircle2,
  FolderTree,
  Heart,
  Loader2,
  Lock,
  MessageSquare,
  Pin,
  Search,
  Users,
} from "lucide-react"
import {
  searchAll,
  searchCategories,
  searchPosts,
  searchProfiles,
} from "@/api/search"
import { CategoryLucideIcon } from "@/components/categories/CategoryLucideIcon"
import {
  DeletedGhostBadge,
  ghostPostClassName,
} from "@/components/posts/DeletedGhostBadge"
import { PostsPagination } from "@/components/posts/PostsPagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { getApiErrorMessage } from "@/lib/categories"
import type {

  Category,
  PagedPostsResponse,
  PagedProfilesResponse,
  SearchResultsResponse,
} from "@/types"

const PAGE_SIZE = 15

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const q = searchParams.get("q") || ""
  const activeTab = searchParams.get("tab") || "all"
  const pageFromUrl = Math.max(1, Number(searchParams.get("page") || "1") || 1)

  const [inputQuery, setInputQuery] = useState(q)

  // Data states
  const [allResults, setAllResults] = useState<SearchResultsResponse | null>(null)
  const [postsPage, setPostsPage] = useState<PagedPostsResponse | null>(null)
  const [categoriesList, setCategoriesList] = useState<Category[] | null>(null)
  const [profilesPage, setProfilesPage] = useState<PagedProfilesResponse | null>(null)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Keep input synchronized with query param
  useEffect(() => {
    setInputQuery(q)
  }, [q])

  // Fetch search results based on active tab and query
  useEffect(() => {
    if (!q.trim()) {
      setAllResults(null)
      setPostsPage(null)
      setCategoriesList(null)
      setProfilesPage(null)
      setLoading(false)
      setErrorMsg(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setErrorMsg(null)

    async function executeSearch() {
      try {
        if (activeTab === "all") {
          const data = await searchAll(q, 6)
          if (!cancelled) setAllResults(data)
        } else if (activeTab === "posts") {
          const data = await searchPosts({
            q,
            page: pageFromUrl,
            pageSize: PAGE_SIZE,
          })
          if (!cancelled) setPostsPage(data)
        } else if (activeTab === "categories") {
          const data = await searchCategories({ q })
          if (!cancelled) setCategoriesList(data)
        } else if (activeTab === "profiles") {
          const data = await searchProfiles({
            q,
            page: pageFromUrl,
            pageSize: PAGE_SIZE,
          })
          if (!cancelled) setProfilesPage(data)
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(getApiErrorMessage(err, "An error occurred while searching."))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void executeSearch()
    return () => {
      cancelled = true
    }
  }, [q, activeTab, pageFromUrl])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuery.trim()) return

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set("q", inputQuery.trim())
        next.delete("page")
        return next
      },
      { replace: true },
    )
  }

  const setTab = (newTab: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (newTab === "all") {
          next.delete("tab")
        } else {
          next.set("tab", newTab)
        }
        next.delete("page")
        return next
      },
      { replace: true },
    )
  }

  const setPage = (nextPage: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (nextPage <= 1) {
          next.delete("page")
        } else {
          next.set("page", String(nextPage))
        }
        return next
      },
      { replace: true },
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="max-w-2xl space-y-4">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Search UCB Forum
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Find campus discussions, department categories, and faculty or student profiles.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search by keyword, topic, or username..."
                className="pl-9 h-10 bg-background"
              />
            </div>
            <Button type="submit" className="h-10 px-5">
              Search
            </Button>
          </form>
        </div>
      </div>

      {q.trim() && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
            <Button
              type="button"
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("all")}
              className="gap-1.5 rounded-full"
            >
              All Results
            </Button>
            <Button
              type="button"
              variant={activeTab === "posts" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("posts")}
              className="gap-1.5 rounded-full"
            >
              <MessageSquare className="size-3.5" />
              Discussions
            </Button>
            <Button
              type="button"
              variant={activeTab === "categories" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("categories")}
              className="gap-1.5 rounded-full"
            >
              <FolderTree className="size-3.5" />
              Categories
            </Button>
            <Button
              type="button"
              variant={activeTab === "profiles" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("profiles")}
              className="gap-1.5 rounded-full"
            >
              <Users className="size-3.5" />
              Members
            </Button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              Searching for &quot;{q}&quot;...
            </div>
          )}

          {/* Error Message */}
          {!loading && errorMsg && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">{errorMsg}</p>
            </div>
          )}

          {/* Content Views */}
          {!loading && !errorMsg && (
            <>
              {/* TAB 1: ALL RESULTS OVERVIEW */}
              {activeTab === "all" && allResults && (
                <div className="space-y-8">
                  {allResults.categories.length === 0 &&
                  allResults.posts.length === 0 &&
                  allResults.profiles.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-muted/20 py-16 text-center">
                      <Search className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                      <p className="text-base font-semibold text-foreground">
                        No matches found for &quot;{q}&quot;
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                        Try searching with different keywords, checking your spelling, or exploring all forum categories.
                      </p>
                      <Button asChild size="sm" variant="outline" className="mt-4">
                        <Link to="/categories">Browse Categories</Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Categories section in All */}
                      {allResults.categories.length > 0 && (
                        <Card>
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                              <FolderTree className="size-4 text-primary" />
                              <span>Categories</span>
                              <Badge variant="outline" className="font-normal text-xs">
                                {allResults.categories.length}
                              </Badge>
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setTab("categories")}
                              className="text-xs text-primary"
                            >
                              View all
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {allResults.categories.map((cat) => (
                                <Link
                                  key={cat.categoryId}
                                  to={`/categories/${cat.slug}`}
                                  className="group flex items-start gap-3 rounded-xl border border-border p-3.5 hover:border-primary/40 hover:bg-muted/30 transition-all"
                                >
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <CategoryLucideIcon
                                      iconClass={cat.iconClass}
                                      className="size-4"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                      {cat.name}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                      {cat.description || "No description provided."}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Discussions section in All */}
                      {allResults.posts.length > 0 && (
                        <Card>
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                              <MessageSquare className="size-4 text-primary" />
                              <span>Discussions</span>
                              <Badge variant="outline" className="font-normal text-xs">
                                {allResults.posts.length}
                              </Badge>
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setTab("posts")}
                              className="text-xs text-primary"
                            >
                              View all
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <ul className="divide-y divide-border rounded-lg border border-border/80">
                              {allResults.posts.map((post) => (
                                <li
                                  key={post.postId}
                                  className={ghostPostClassName(post.isDeleted)}
                                >
                                  <Link
                                    to={`/posts/${post.postId}`}
                                    className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/40 transition-colors sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        {post.isDeleted && <DeletedGhostBadge />}
                                        {post.isPinned && (
                                          <Badge
                                            variant="outline"
                                            className="gap-1 border-primary/30 bg-primary/10 text-primary text-[10px]"
                                          >
                                            <Pin className="size-2.5" />
                                            Pinned
                                          </Badge>
                                        )}
                                        <p className="truncate text-sm font-semibold text-foreground">
                                          {post.title || "Untitled Discussion"}
                                        </p>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {post.categoryName && (
                                          <span className="text-foreground/70">
                                            {post.categoryName} ·{" "}
                                          </span>
                                        )}
                                        by {post.authorUsername} ·{" "}
                                        {new Date(post.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <Heart
                                          className={`size-3.5 ${post.isLikedByCaller ? "fill-current text-destructive" : ""}`}
                                        />
                                        {post.likesCount}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <MessageSquare className="size-3.5" />
                                        {post.replyCount}
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Members section in All */}
                      {allResults.profiles.length > 0 && (
                        <Card>
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                              <Users className="size-4 text-primary" />
                              <span>Members</span>
                              <Badge variant="outline" className="font-normal text-xs">
                                {allResults.profiles.length}
                              </Badge>
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setTab("profiles")}
                              className="text-xs text-primary"
                            >
                              View all
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {allResults.profiles.map((prof) => (
                                <Link
                                  key={prof.profileId}
                                  to={
                                    user?.userId === prof.userId
                                      ? "/profile"
                                      : `/users/${prof.userId}`
                                  }
                                  className="group flex items-center justify-between rounded-xl border border-border p-3 hover:border-primary/40 hover:bg-muted/30 transition-all"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                                      {prof.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
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
                                          ? prof.department || "Faculty"
                                          : prof.isVerifiedStudent
                                            ? prof.program || "Student"
                                            : "Member"}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground shrink-0 pl-2">
                                    {prof.reputation} rep
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: DISCUSSIONS */}
              {activeTab === "posts" && postsPage && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <MessageSquare className="size-4 text-primary" />
                      <span>Discussion Results</span>
                      <Badge variant="outline" className="font-normal">
                        {postsPage.totalCount}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {postsPage.items.length === 0 ? (
                      <div className="py-12 text-center">
                        <MessageSquare className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                          No discussions found matching &quot;{q}&quot;.
                        </p>
                      </div>
                    ) : (
                      <>
                        <ul className="divide-y divide-border rounded-lg border border-border/80">
                          {postsPage.items.map((post) => (
                            <li
                              key={post.postId}
                              className={ghostPostClassName(post.isDeleted)}
                            >
                              <Link
                                to={`/posts/${post.postId}`}
                                className="flex flex-col gap-2 px-4 py-3.5 hover:bg-muted/40 transition-colors sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {post.isDeleted && <DeletedGhostBadge />}
                                    {post.isPinned && (
                                      <Badge
                                        variant="outline"
                                        className="gap-1 border-primary/30 bg-primary/10 text-primary text-[10px]"
                                      >
                                        <Pin className="size-2.5" />
                                        Pinned
                                      </Badge>
                                    )}
                                    <p className="truncate text-sm font-semibold text-foreground">
                                      {post.title || "Untitled Discussion"}
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {post.categoryName && (
                                      <span className="text-foreground/70">
                                        {post.categoryName} ·{" "}
                                      </span>
                                    )}
                                    by {post.authorUsername} ·{" "}
                                    {new Date(post.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                                  <span className="inline-flex items-center gap-1">
                                    <Heart
                                      className={`size-3.5 ${post.isLikedByCaller ? "fill-current text-destructive" : ""}`}
                                    />
                                    {post.likesCount}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <MessageSquare className="size-3.5" />
                                    {post.replyCount}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>

                        <PostsPagination
                          page={postsPage.page}
                          totalPages={postsPage.totalPages}
                          disabled={loading}
                          onPageChange={setPage}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === "categories" && categoriesList && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <FolderTree className="size-4 text-primary" />
                      <span>Category Results</span>
                      <Badge variant="outline" className="font-normal">
                        {categoriesList.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoriesList.length === 0 ? (
                      <div className="py-12 text-center">
                        <FolderTree className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                          No categories found matching &quot;{q}&quot;.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoriesList.map((cat) => (
                          <Link
                            key={cat.categoryId}
                            to={`/categories/${cat.slug}`}
                            className="group flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-muted/30 transition-all"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <CategoryLucideIcon
                                iconClass={cat.iconClass}
                                className="size-5"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {cat.name}
                                </h4>
                                {cat.isRestricted && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 px-1.5 h-4 gap-1 text-muted-foreground shrink-0"
                                  >
                                    <Lock className="size-2.5" />
                                    Restricted
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {cat.description || "No description provided."}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* TAB 4: MEMBERS */}
              {activeTab === "profiles" && profilesPage && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Users className="size-4 text-primary" />
                      <span>Member Results</span>
                      <Badge variant="outline" className="font-normal">
                        {profilesPage.totalCount}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profilesPage.items.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                          No members found matching &quot;{q}&quot;.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {profilesPage.items.map((prof) => (
                            <Link
                              key={prof.profileId}
                              to={
                                user?.userId === prof.userId
                                  ? "/profile"
                                  : `/users/${prof.userId}`
                              }
                              className="group flex items-center justify-between rounded-xl border border-border p-3.5 hover:border-primary/40 hover:bg-muted/30 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                                  {prof.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                      {prof.username}
                                    </span>
                                    {prof.isVerifiedStudent && (
                                      <CheckCircle2 className="size-3.5 text-blue-500 shrink-0" />
                                    )}
                                    {prof.isVerifiedTeacher && (
                                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {prof.isVerifiedTeacher
                                      ? prof.department || "Faculty Member"
                                      : prof.isVerifiedStudent
                                        ? prof.program || "Student"
                                        : "Campus Member"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground font-medium shrink-0 pl-2">
                                {prof.reputation} rep
                              </span>
                            </Link>
                          ))}
                        </div>

                        <PostsPagination
                          page={profilesPage.page}
                          totalPages={profilesPage.totalPages}
                          disabled={loading}
                          onPageChange={setPage}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
