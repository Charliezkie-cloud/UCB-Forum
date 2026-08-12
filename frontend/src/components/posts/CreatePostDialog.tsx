import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { createPost } from "@/api/posts"
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

interface CreatePostDialogProps {
  open: boolean
  categoryId: number
  categoryName: string
  onOpenChange: (open: boolean) => void
  onSuccess: (post: Post) => void
}

export function CreatePostDialog({
  open,
  categoryId,
  categoryName,
  onOpenChange,
  onSuccess,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState("")
  const [contentHtml, setContentHtml] = useState("")
  const [editorKey, setEditorKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle("")
    setContentHtml("")
    setErrorMsg(null)
    setEditorKey((prev) => prev + 1)
  }, [open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setErrorMsg("Title is required.")
      return
    }
    if (trimmedTitle.length > 255) {
      setErrorMsg("Title must be 255 characters or fewer.")
      return
    }
    if (isHtmlContentEmpty(contentHtml)) {
      setErrorMsg("Content is required.")
      return
    }

    try {
      setSaving(true)
      setErrorMsg(null)
      const post = await createPost({
        categoryId,
        title: trimmedTitle,
        content: contentHtml,
      })
      onSuccess(post)
      onOpenChange(false)
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, "Failed to create post."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={(e) => void handleSubmit(e)}>
          <DialogHeader>
            <DialogTitle>New discussion</DialogTitle>
            <DialogDescription>
              Start a thread in {categoryName}.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to talk about?"
                maxLength={255}
                disabled={saving}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                key={editorKey}
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

          <DialogFooter className="mt-6">
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
                  Posting…
                </>
              ) : (
                "Create post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
