import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { createPost } from "@/api/posts"
import { RichTextEditor } from "@/components/posts/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/lib/categories"
import { isHtmlContentEmpty } from "@/lib/postHtml"
import type { Post } from "@/types"

interface ReplyComposerProps {
  categoryId: number
  parentPostId: number
  onSuccess: (reply: Post) => void
  onCancel?: () => void
  label?: string
  placeholder?: string
  submitLabel?: string
  autoFocus?: boolean
}

export function ReplyComposer({
  categoryId,
  parentPostId,
  onSuccess,
  onCancel,
  label = "Your reply",
  placeholder = "Write a reply…",
  submitLabel = "Post reply",
  autoFocus = false,
}: ReplyComposerProps) {
  const [contentHtml, setContentHtml] = useState("")
  const [editorKey, setEditorKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setContentHtml("")
    setErrorMsg(null)
    setEditorKey((prev) => prev + 1)
  }, [parentPostId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isHtmlContentEmpty(contentHtml)) {
      setErrorMsg("Content is required.")
      return
    }

    try {
      setSaving(true)
      setErrorMsg(null)
      const reply = await createPost({
        categoryId,
        parentPostId,
        content: contentHtml,
      })
      onSuccess(reply)
      setContentHtml("")
      setEditorKey((prev) => prev + 1)
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, "Failed to post reply."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <div className="space-y-2">
        {label ? <Label>{label}</Label> : null}
        <RichTextEditor
          key={editorKey}
          onChangeHtml={setContentHtml}
          disabled={saving}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Posting…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
