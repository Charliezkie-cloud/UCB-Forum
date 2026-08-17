import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { updatePost } from "@/api/posts"
import { RichTextEditor } from "@/components/posts/RichTextEditor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/lib/categories"
import { isHtmlContentEmpty } from "@/lib/postHtml"
import type { Post } from "@/types"

interface EditPostDialogProps {
  open: boolean
  post: Post
  onOpenChange: (open: boolean) => void
  onSuccess: (post: Post) => void
}

export function EditPostDialog({
  open,
  post,
  onOpenChange,
  onSuccess,
}: EditPostDialogProps) {
  const isTopLevel = post.parentPostId === null
  const [title, setTitle] = useState(post.title ?? "")
  const [contentHtml, setContentHtml] = useState(post.content)
  const [editorKey, setEditorKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(post.title ?? "")
    setContentHtml(post.content)
    setErrorMsg(null)
    setEditorKey((prev) => prev + 1)
  }, [open, post])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (isTopLevel) {
      if (!trimmedTitle) {
        setErrorMsg("Title is required.")
        return
      }
      if (trimmedTitle.length > 255) {
        setErrorMsg("Title must be 255 characters or fewer.")
        return
      }
    }
    if (isHtmlContentEmpty(contentHtml)) {
      setErrorMsg("Content is required.")
      return
    }

    try {
      setSaving(true)
      setErrorMsg(null)
      const updated = await updatePost(post.postId, {
        title: isTopLevel ? trimmedTitle : undefined,
        content: contentHtml,
      })
      onSuccess(updated)
      onOpenChange(false)
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, "Failed to update post."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              Update your {isTopLevel ? "discussion" : "reply"} and save the changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isTopLevel && (
              <div className="space-y-2">
                <Label htmlFor="edit-post-title">Title</Label>
                <Input
                  id="edit-post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to talk about?"
                  maxLength={255}
                  disabled={saving}
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                key={editorKey}
                initialHtml={post.content}
                onChangeHtml={setContentHtml}
                disabled={saving}
                placeholder="Share details, questions, or resources…"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-destructive" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
