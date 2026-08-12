import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Loader2,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react"
import { deletePost, getPosts, likePost, unlikePost } from "@/api/posts"
import {
  DeletedGhostBadge,
  ghostPostClassName,
} from "@/components/posts/DeletedGhostBadge"
import { EditPostDialog } from "@/components/posts/EditPostDialog"
import { PostContent } from "@/components/posts/PostContent"
import { PostsPagination } from "@/components/posts/PostsPagination"
import { ReplyComposer } from "@/components/posts/ReplyComposer"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getApiErrorMessage } from "@/lib/categories"
import { cn } from "@/lib/utils"
import type { PagedPostsResponse, Post } from "@/types"

const CHILDREN_PAGE_SIZE = 20

interface ReplyThreadProps {
  reply: Post
  categoryId: number
  depth?: number
  canMutatePosts?: boolean
  onError: (message: string) => void
  onReplyDeleted?: () => void
}

export function ReplyThread({
  reply: initialReply,
  categoryId,
  depth = 0,
  canMutatePosts = true,
  onError,
  onReplyDeleted,
}: ReplyThreadProps) {
  const { user } = useAuth()
  const [reply, setReply] = useState(initialReply)
  const [showComposer, setShowComposer] = useState(false)
  const [editing, setEditing] = useState(false)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [childrenExpanded, setChildrenExpanded] = useState(initialReply.replyCount > 0)
  const [childrenPage, setChildrenPage] = useState<PagedPostsResponse | null>(null)
  const [childrenLoading, setChildrenLoading] = useState(false)
  const [childrenError, setChildrenError] = useState<string | null>(null)
  const [childrenPageNum, setChildrenPageNum] = useState(1)
  const [childrenReloadKey, setChildrenReloadKey] = useState(0)

  useEffect(() => {
    setReply(initialReply)
  }, [initialReply])

  useEffect(() => {
    if (!childrenExpanded) return

    let cancelled = false

    async function loadChildren() {
      try {
        setChildrenLoading(true)
        setChildrenError(null)
        const data = await getPosts({
          categoryId,
          parentPostId: reply.postId,
          page: childrenPageNum,
          pageSize: CHILDREN_PAGE_SIZE,
        })
        if (cancelled) return

        if (data.totalPages > 0 && childrenPageNum > data.totalPages) {
          setChildrenPageNum(data.totalPages)
          return
        }

        setChildrenPage(data)
        setReply((prev) =>
          prev.replyCount === data.totalCount
            ? prev
            : { ...prev, replyCount: data.totalCount },
        )
      } catch (error: unknown) {
        if (cancelled) return
        setChildrenError(getApiErrorMessage(error, "Failed to load replies."))
        setChildrenPage(null)
      } finally {
        if (!cancelled) setChildrenLoading(false)
      }
    }

    void loadChildren()
    return () => {
      cancelled = true
    }
  }, [
    childrenExpanded,
    childrenPageNum,
    childrenReloadKey,
    categoryId,
    reply.postId,
  ])

  const isAuthor = user?.userId === reply.authorId
  const canEditOrDelete = isAuthor && canMutatePosts
  const busy = liking || deleting
  const replyDate = new Date(reply.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
  const handleToggleLike = async () => {
    if (liking) return

    try {
      setLiking(true)
      const result = reply.isLikedByCaller
        ? await unlikePost(reply.postId)
        : await likePost(reply.postId)
      setReply((prev) => ({
        ...prev,
        likesCount: result.likesCount,
        isLikedByCaller: result.isLikedByCaller,
      }))
    } catch (error: unknown) {
      onError(getApiErrorMessage(error, "Failed to update like."))
    } finally {
      setLiking(false)
    }
  }

  const handleDelete = async () => {
    if (deleting) return

    const confirmed = window.confirm("Delete this reply? This cannot be undone.")
    if (!confirmed) return

    try {
      setDeleting(true)
      await deletePost(reply.postId)
      onReplyDeleted?.()
    } catch (error: unknown) {
      onError(getApiErrorMessage(error, "Failed to delete reply."))
    } finally {
      setDeleting(false)
    }
  }

  const handleNestedReplyCreated = (created: Post) => {
    setShowComposer(false)
    setReply((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }))
    setChildrenExpanded(true)
    if (childrenPageNum !== 1) {
      setChildrenPageNum(1)
    } else if (childrenPage) {
      setChildrenPage((prev) =>
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
      setChildrenReloadKey((k) => k + 1)
    }
  }

  const handleChildDeleted = () => {
    setReply((prev) => ({
      ...prev,
      replyCount: Math.max(0, prev.replyCount - 1),
    }))
    setChildrenReloadKey((k) => k + 1)
  }

  const handleUpdated = (updated: Post) => {
    setReply(updated)
    setEditing(false)
  }

  return (
    <div className={cn(depth > 0 && "ml-2 border-l-2 border-border/70 pl-3 sm:ml-3 sm:pl-4")}>
      <article
        className={cn(
          "space-y-3 py-4",
          ghostPostClassName(
            reply.isDeleted,
            reply.isDeleted && "rounded-lg border px-3 sm:px-4",
          ),
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {reply.isDeleted && <DeletedGhostBadge />}
            <p className="text-sm text-muted-foreground">
              <Link
                to={`/users/${reply.authorId}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {reply.authorUsername}
              </Link>{" "}
              · {replyDate}
            </p>
          </div>
          {!reply.isDeleted && (
            <div className="flex flex-wrap items-center gap-1.5">
              {canEditOrDelete && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    disabled={busy}
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-destructive hover:text-destructive"
                    disabled={busy}
                    onClick={() => void handleDelete()}
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
                variant={reply.isLikedByCaller ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1.5"
                disabled={busy}
                onClick={() => void handleToggleLike()}
              >
                {liking ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Heart
                    className={`size-3.5 ${reply.isLikedByCaller ? "fill-current" : ""}`}
                  />
                )}
                {reply.likesCount}
              </Button>
              {canMutatePosts && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={busy}
                  onClick={() => setShowComposer((open) => !open)}
                >
                  <MessageSquare className="size-3.5" />
                  Reply
                </Button>
              )}
            </div>
          )}
          {reply.isDeleted && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Heart
                  className={`size-3.5 ${reply.isLikedByCaller ? "fill-current" : ""}`}
                />
                {reply.likesCount}
              </span>
            </div>
          )}
        </div>

        <PostContent html={reply.content} />

        {showComposer && !reply.isDeleted && canMutatePosts && (
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <ReplyComposer
              categoryId={categoryId}
              parentPostId={reply.postId}
              label=""
              placeholder={`Reply to ${reply.authorUsername}…`}
              submitLabel="Reply"
              autoFocus
              onCancel={() => setShowComposer(false)}
              onSuccess={handleNestedReplyCreated}
            />
          </div>
        )}

        {reply.replyCount > 0 && (
          <div className="pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-muted-foreground"
              onClick={() => setChildrenExpanded((open) => !open)}
            >
              {childrenExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
              {childrenExpanded
                ? "Hide replies"
                : `${reply.replyCount} ${reply.replyCount === 1 ? "reply" : "replies"}`}
            </Button>
          </div>
        )}
      </article>

      {childrenExpanded && reply.replyCount > 0 && (
        <div className="pb-1">
          {childrenLoading && !childrenPage ? (
            <div className="flex items-center gap-2 py-3 pl-1 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Loading replies…
            </div>
          ) : childrenError ? (
            <div className="space-y-2 py-3 pl-1">
              <p className="text-sm text-destructive">{childrenError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChildrenReloadKey((k) => k + 1)}
              >
                Try again
              </Button>
            </div>
          ) : childrenPage && childrenPage.items.length > 0 ? (
            <div className="space-y-0">
              {childrenPage.items.map((child) => (
                <ReplyThread
                  key={child.postId}
                  reply={child}
                  categoryId={categoryId}
                  depth={depth + 1}
                  canMutatePosts={canMutatePosts}
                  onError={onError}
                  onReplyDeleted={handleChildDeleted}
                />
              ))}
              {childrenPage.totalPages > 1 && (
                <div className="py-2">
                  <PostsPagination
                    page={childrenPage.page}
                    totalPages={childrenPage.totalPages}
                    disabled={childrenLoading}
                    onPageChange={setChildrenPageNum}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {canEditOrDelete && editing && (
        <EditPostDialog
          open={editing}
          post={reply}
          onOpenChange={(open) => {
            if (!open) setEditing(false)
          }}
          onSuccess={handleUpdated}
        />
      )}
    </div>
  )
}
