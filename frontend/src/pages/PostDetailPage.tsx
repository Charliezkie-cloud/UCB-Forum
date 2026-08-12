import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Heart,
  Loader2,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react"
import { getCategoryById } from "@/api/categories"
import {
  deletePost,
  getPostById,
  getPosts,
  likePost,
  unlikePost,
} from "@/api/posts"
import {
  DeletedGhostBadge,
  ghostPostClassName,
} from "@/components/posts/DeletedGhostBadge"
import { EditPostDialog } from "@/components/posts/EditPostDialog"
import { PostContent } from "@/components/posts/PostContent"
import { PostsPagination } from "@/components/posts/PostsPagination"
import { ReplyComposer } from "@/components/posts/ReplyComposer"
import { ReplyThread } from "@/components/posts/ReplyThread"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { getApiErrorMessage } from "@/lib/categories"
import type { Category, PagedPostsResponse, Post } from "@/types"

const REPLIES_PAGE_SIZE = 20

export function PostDetailPage() {
  const { postId: postIdParam } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const postId = Number(postIdParam)

  const [post, setPost] = useState<Post | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [liking, setLiking] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [repliesPage, setRepliesPage] = useState<PagedPostsResponse | null>(null)
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [repliesError, setRepliesError] = useState<string | null>(null)
  const [repliesPageNum, setRepliesPageNum] = useState(1)
  const [repliesReloadKey, setRepliesReloadKey] = useState(0)

  useEffect(() => {
    async function loadPost() {
      if (!Number.isInteger(postId) || postId < 1) {
        setErrorMsg("Invalid post id.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setErrorMsg(null)
        const postData = await getPostById(postId)
        setPost(postData)
        setRepliesPageNum(1)

        try {
          const categoryData = await getCategoryById(postData.categoryId)
          setCategory(categoryData)
        } catch {
          setCategory(null)
        }
      } catch (error: unknown) {
        setErrorMsg(getApiErrorMessage(error, "This post could not be found."))
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    void loadPost()
  }, [postId])

  useEffect(() => {
    if (!post) {
      setRepliesPage(null)
      return
    }

    let cancelled = false

    async function loadReplies() {
      try {
        setRepliesLoading(true)
        setRepliesError(null)
        const data = await getPosts({
          categoryId: post!.categoryId,
          parentPostId: post!.postId,
          page: repliesPageNum,
          pageSize: REPLIES_PAGE_SIZE,
        })
        if (cancelled) return

        if (data.totalPages > 0 && repliesPageNum > data.totalPages) {
          setRepliesPageNum(data.totalPages)
          return
        }

        setRepliesPage(data)
        setPost((prev) =>
          prev ? { ...prev, replyCount: data.totalCount } : prev,
        )
      } catch (error: unknown) {
        if (cancelled) return
        setRepliesError(getApiErrorMessage(error, "Failed to load replies."))
        setRepliesPage(null)
      } finally {
        if (!cancelled) setRepliesLoading(false)
      }
    }

    void loadReplies()
    return () => {
      cancelled = true
    }
  }, [post?.postId, post?.categoryId, repliesPageNum, repliesReloadKey])

  const handleToggleLike = async () => {
    if (!post || liking) return

    try {
      setLiking(true)
      setActionError(null)
      const result = post.isLikedByCaller
        ? await unlikePost(post.postId)
        : await likePost(post.postId)
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: result.likesCount,
              isLikedByCaller: result.isLikedByCaller,
            }
          : prev,
      )
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, "Failed to update like."))
    } finally {
      setLiking(false)
    }
  }

  const handlePostUpdated = (updated: Post) => {
    setPost(updated)
    setActionError(null)
  }

  const handleDelete = async () => {
    if (!post || deleting) return

    const label = post.title?.trim() || "this post"
    const confirmed = window.confirm(
      `Delete "${label}"? This cannot be undone.`,
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      setActionError(null)
      await deletePost(post.postId)
      if (category) {
        navigate(`/categories/${category.slug}`, { replace: true })
      } else {
        navigate("/categories", { replace: true })
      }
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, "Failed to delete post."))
    } finally {
      setDeleting(false)
    }
  }

  const handleTopLevelReplyCreated = (created: Post) => {
    setActionError(null)
    setPost((prev) =>
      prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev,
    )
    if (repliesPageNum !== 1) {
      setRepliesPageNum(1)
    } else if (repliesPage) {
      setRepliesPage((prev) =>
        prev
          ? {
              ...prev,
              items: [created, ...prev.items],
              totalCount: prev.totalCount + 1,
              totalPages: Math.max(
                1,
                Math.ceil((prev.totalCount + 1) / prev.pageSize),
              ),
            }
          : prev,
      )
    } else {
      setRepliesReloadKey((k) => k + 1)
    }
  }

  const handleTopLevelReplyDeleted = () => {
    setPost((prev) =>
      prev
        ? { ...prev, replyCount: Math.max(0, prev.replyCount - 1) }
        : prev,
    )
    setRepliesReloadKey((k) => k + 1)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading post…</p>
      </div>
    )
  }

  if (!post || errorMsg) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Post not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {errorMsg || "This post doesn't exist or may have been removed."}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link to="/categories">Browse categories</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isAuthor = user?.userId === post.authorId
  const createdDate = new Date(post.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link to="/categories" className="transition-colors hover:text-foreground">
          Categories
        </Link>
        {category && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              to={`/categories/${category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="font-medium text-foreground line-clamp-1">
          {post.title || "Post"}
        </span>
      </nav>

      <Card className={ghostPostClassName(post.isDeleted)}>
        <CardHeader className="space-y-3 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {post.isDeleted && <DeletedGhostBadge />}
                {post.isPinned && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 text-primary"
                  >
                    Pinned
                  </Badge>
                )}
              </div>
              <CardTitle className="font-heading text-2xl font-bold tracking-tight">
                {post.title || "Untitled"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                by{" "}
                <Link
                  to={`/users/${post.authorId}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {post.authorUsername}
                </Link>{" "}
                · {createdDate}
              </p>
            </div>
            {!post.isDeleted && (
              <div className="flex flex-wrap items-center gap-2">
                {isAuthor && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => setEditOpen(true)}
                      disabled={deleting}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => void handleDelete()}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant={post.isLikedByCaller ? "default" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={liking || deleting}
                  onClick={() => void handleToggleLike()}
                >
                  {liking ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Heart
                      className={`size-3.5 ${post.isLikedByCaller ? "fill-current" : ""}`}
                    />
                  )}
                  {post.likesCount}
                </Button>
              </div>
            )}
            {post.isDeleted && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart
                    className={`size-3.5 ${post.isLikedByCaller ? "fill-current" : ""}`}
                  />
                  {post.likesCount}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}
          <PostContent html={post.content} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="size-4 text-primary" />
            <span>Replies</span>
            <Badge variant="outline" className="font-normal">
              {post.replyCount}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!post.isDeleted && (
            <ReplyComposer
              categoryId={post.categoryId}
              parentPostId={post.postId}
              onSuccess={handleTopLevelReplyCreated}
            />
          )}
          {post.isDeleted && (
            <p className="rounded-lg border border-dashed border-muted-foreground/35 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              This post is deleted. New replies are disabled.
            </p>
          )}

          {repliesLoading && !repliesPage ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading replies…
            </div>
          ) : repliesError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 py-8 text-center">
              <p className="text-sm text-destructive">{repliesError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setRepliesReloadKey((k) => k + 1)}
              >
                Try again
              </Button>
            </div>
          ) : !repliesPage || repliesPage.items.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {post.isDeleted
                  ? "No replies on this deleted post."
                  : "No replies yet. Be the first to reply."}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border rounded-lg border border-border/80 px-4">
                {repliesPage.items.map((reply) => (
                  <ReplyThread
                    key={reply.postId}
                    reply={reply}
                    categoryId={post.categoryId}
                    onError={setActionError}
                    onReplyDeleted={handleTopLevelReplyDeleted}
                  />
                ))}
              </div>

              <PostsPagination
                page={repliesPage.page}
                totalPages={repliesPage.totalPages}
                disabled={repliesLoading}
                onPageChange={setRepliesPageNum}
              />
            </>
          )}

          {category && (
            <div className="flex justify-center pt-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/categories/${category.slug}`}>Back to category</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isAuthor && (
        <EditPostDialog
          open={editOpen}
          post={post}
          onOpenChange={setEditOpen}
          onSuccess={handlePostUpdated}
        />
      )}
    </div>
  )
}
