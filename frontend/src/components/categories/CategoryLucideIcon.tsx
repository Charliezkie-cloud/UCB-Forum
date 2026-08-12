import { useEffect, useMemo } from "react"

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void
    }
  }
}

let lucideScriptPromise: Promise<void> | null = null
let createIconsQueued = false

function normalizeLucideIconName(iconClass: string | null | undefined): string {
  const raw = iconClass?.trim()
  if (!raw) return "folder-tree"

  // Common user inputs:
  // - "lucide-folder-tree"
  // - "folder-tree"
  // - ".folder-tree"
  const firstToken = raw.split(/\s+/)[0] ?? raw
  const withoutDot = firstToken.replace(/^[.#]/, "")
  const withoutLucidePrefix = withoutDot.startsWith("lucide-")
    ? withoutDot.slice("lucide-".length)
    : withoutDot

  return withoutLucidePrefix || "folder-tree"
}

function loadLucideScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.lucide?.createIcons) return Promise.resolve()
  if (lucideScriptPromise) return lucideScriptPromise

  lucideScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-lucide="vanilla"]') as
      | HTMLScriptElement
      | undefined
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Failed to load Lucide.")))
      return
    }

    const script = document.createElement("script")
    script.src = "https://unpkg.com/lucide@latest"
    script.async = true
    script.defer = true
    script.setAttribute("data-lucide", "vanilla")
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Lucide."))
    document.head.appendChild(script)
  })

  return lucideScriptPromise
}

function queueCreateIcons() {
  if (createIconsQueued) return
  createIconsQueued = true

  window.requestAnimationFrame(() => {
    createIconsQueued = false
    window.lucide?.createIcons?.()
  })
}

export function CategoryLucideIcon({
  iconClass,
  className,
}: {
  iconClass: string | null | undefined
  className?: string
}) {
  const lucideIconName = useMemo(
    () => normalizeLucideIconName(iconClass),
    [iconClass],
  )

  useEffect(() => {
    void loadLucideScript()
      .then(() => queueCreateIcons())
      .catch(() => {
        // If Lucide fails to load, fall back to rendering nothing.
      })
  }, [lucideIconName])

  return <i data-lucide={lucideIconName} className={className} aria-hidden="true" />
}

