import { useEffect, useState } from "react"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { FolderTree, Heart, Loader2, MessageSquare, PanelLeft, Pin } from "lucide-react"
import { getLatestPosts } from "@/api/posts"
import { CategoriesSidebarMenu } from "@/components/categories/CategoriesSidebarMenu"
import {
  DeletedGhostBadge,
  ghostPostClassName,
} from "@/components/posts/DeletedGhostBadge"
import { PostsPagination } from "@/components/posts/PostsPagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getApiErrorMessage } from "@/lib/categories"
import { cn } from "@/lib/utils"
import type { PagedPostsResponse } from "@/types"

const POSTS_PAGE_SIZE = 20

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const pageFromUrl = Math.max(1, Number(searchParams.get("page") || "1") || 1)

  const [postsPage, setPostsPage] = useState<PagedPostsResponse | null>(null)
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [postsReloadKey, setPostsReloadKey] = useState(0)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    let cancelled = false

    async function loadPosts() {
      try {
        setPostsLoading(true)
        setPostsError(null)
        const data = await getLatestPosts({
          page: pageFromUrl,
          pageSize: POSTS_PAGE_SIZE,
        })
        if (cancelled) return

        if (data.totalPages > 0 && pageFromUrl > data.totalPages) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev)
              next.set("page", String(data.totalPages))
              return next
            },
            { replace: true },
          )
          return
        }

        setPostsPage(data)
      } catch (error: unknown) {
        if (cancelled) return
        setPostsError(getApiErrorMessage(error, "Failed to load posts."))
        setPostsPage(null)
      } finally {
        if (!cancelled) setPostsLoading(false)
      }
    }

    void loadPosts()
    return () => {
      cancelled = true
    }
  }, [pageFromUrl, postsReloadKey, setSearchParams])

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
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Docked Left Sidebar on Desktop */}
      <aside className="hidden lg:block w-72 shrink-0 xl:w-80 sticky top-20">
        <CategoriesSidebarMenu />
      </aside>

      {/* Main Content Area - Centered Feed */}
      <div className="flex-1 min-w-0 w-full flex justify-center">
        <section className="w-full max-w-3xl">
          {/* Mobile Sidebar Trigger Bar */}
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs font-medium shadow-xs"
                >
                  <PanelLeft className="size-4 text-primary" />
                  <span>Categories</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[310px] p-4 sm:w-[360px] overflow-y-auto"
              >
                <SheetHeader className="p-0 pb-3">
                  <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                    <FolderTree className="size-4 text-primary" />
                    <span>Categories</span>
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    Explore departmental spaces, course subjects, and campus topics.
                  </SheetDescription>
                </SheetHeader>
                <div className="pt-2">
                  <CategoriesSidebarMenu />
                </div>
              </SheetContent>
            </Sheet>

            <Link
              to="/categories"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              All categories &rarr;
            </Link>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <MessageSquare className="size-4 text-primary" />
                <span>Latest discussions</span>
                {postsPage && postsPage.totalCount > 0 && (
                  <Badge variant="outline" className="ml-1 font-normal">
                    {postsPage.totalCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {postsLoading && !postsPage ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading posts…
                </div>
              ) : postsError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 py-8 text-center">
                  <p className="text-sm text-destructive">{postsError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setPostsReloadKey((k) => k + 1)}
                  >
                    Try again
                  </Button>
                </div>
              ) : !postsPage || postsPage.items.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 py-12 text-center">
                  <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No discussions yet.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    Pick a category and start the first thread.
                  </p>
                  <Button type="button" size="sm" className="mt-4" asChild>
                    <Link to="/categories">Browse categories</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-border rounded-lg border border-border/80">
                    {postsPage.items.map((post) => {
                      const created = new Date(post.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                      return (
                        <li
                          key={post.postId}
                          className={ghostPostClassName(post.isDeleted)}
                        >
                          <Link
                            to={`/posts/${post.postId}`}
                            className={cn(
                              "flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between",
                              post.isDeleted && "hover:bg-muted/20",
                            )}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {post.isDeleted && <DeletedGhostBadge />}
                                {post.isPinned && (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 border-primary/30 bg-primary/10 text-primary"
                                  >
                                    <Pin className="size-3" />
                                    Pinned
                                  </Badge>
                                )}
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {post.title || "Untitled"}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {post.categoryName ? (
                                  <>
                                    <span className="text-foreground/70">
                                      {post.categoryName}
                                    </span>
                                    {" · "}
                                  </>
                                ) : null}
                                by {post.authorUsername} · {created}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Heart
                                  className={`size-3.5 ${
                                    post.isLikedByCaller
                                      ? "fill-current text-destructive"
                                      : ""
                                  }`}
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
                      )
                    })}
                  </ul>

                  <PostsPagination
                    page={postsPage.page}
                    totalPages={postsPage.totalPages}
                    disabled={postsLoading}
                    onPageChange={setPage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
