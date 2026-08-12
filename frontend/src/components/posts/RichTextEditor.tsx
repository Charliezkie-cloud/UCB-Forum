import { useEffect } from "react"
import { Link } from "lucide-react"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import {
  $getRoot,
  FORMAT_TEXT_COMMAND,
  type EditorState,
  type LexicalEditor,
} from "lexical"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const theme = {
  paragraph: "mb-2 last:mb-0",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  list: {
    ul: "list-disc pl-5 mb-2",
    ol: "list-decimal pl-5 mb-2",
    listitem: "mb-0.5",
  },
  link: "text-primary underline underline-offset-2",
}

function InitialHtmlPlugin({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!html?.trim()) return

    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(html, "text/html")
      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()
      root.clear()
      root.append(...nodes)
    })
  }, [editor, html])

  return null
}

function ToolbarPlugin({ disabled }: { disabled?: boolean }) {
  const [editor] = useLexicalComposerContext()

  const format = (command: "bold" | "italic" | "underline") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, command)
  }

  const insertLink = () => {
    const url = window.prompt("Enter URL")
    if (!url?.trim()) return
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim())
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs font-bold"
        disabled={disabled}
        onClick={() => format("bold")}
        aria-label="Bold"
      >
        B
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs italic"
        disabled={disabled}
        onClick={() => format("italic")}
        aria-label="Italic"
      >
        I
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs underline"
        disabled={disabled}
        onClick={() => format("underline")}
        aria-label="Underline"
      >
        U
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={disabled}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        aria-label="Bullet list"
      >
        • List
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={disabled}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        aria-label="Numbered list"
      >
        1. List
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        disabled={disabled}
        onClick={insertLink}
        aria-label="Insert link"
      >
        <Link className="size-3.5" />
        Link
      </Button>
    </div>
  )
}

export interface RichTextEditorProps {
  placeholder?: string
  onChangeHtml: (html: string) => void
  initialHtml?: string
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export function RichTextEditor({
  placeholder = "Write your post…",
  onChangeHtml,
  initialHtml,
  disabled = false,
  className,
  autoFocus = false,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "PostEditor",
    theme,
    editable: !disabled,
    onError(error: Error) {
      throw error
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  }

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null)
      onChangeHtml(html)
    })
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        <ToolbarPlugin disabled={disabled} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-36 px-3 py-2 text-sm outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute top-2 left-3 text-sm text-muted-foreground">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        {initialHtml ? <InitialHtmlPlugin html={initialHtml} /> : null}
        {autoFocus ? <AutoFocusPlugin /> : null}
      </div>
    </LexicalComposer>
  )
}
