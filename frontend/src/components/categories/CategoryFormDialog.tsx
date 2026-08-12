import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { createCategory, updateCategory } from "@/api/categories"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  collectDescendantIds,
  getApiErrorMessage,
  slugifyCategoryName,
} from "@/lib/categories"
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types"

interface CategoryFormDialogProps {
  open: boolean
  mode: "create" | "edit"
  categories: Category[]
  category?: Category | null
  defaultParentCategoryId?: number | null
  onOpenChange: (open: boolean) => void
  onSuccess: (category: Category) => void
}

interface CategoryFormState {
  name: string
  slug: string
  description: string
  iconClass: string
  displayOrder: string
  parentCategoryId: string
  isRestricted: boolean
  isPostingAllowed: boolean
  isActive: boolean
  slugTouched: boolean
}

function toFormState(
  category?: Category | null,
  defaultParentCategoryId?: number | null,
): CategoryFormState {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    iconClass: category?.iconClass ?? "",
    displayOrder: String(category?.displayOrder ?? 0),
    parentCategoryId:
      category?.parentCategoryId != null
        ? String(category.parentCategoryId)
        : defaultParentCategoryId != null
          ? String(defaultParentCategoryId)
          : "",
    isRestricted: category?.isRestricted ?? false,
    isPostingAllowed: category?.isPostingAllowed ?? true,
    isActive: category?.isActive ?? true,
    slugTouched: Boolean(category?.slug),
  }
}

export function CategoryFormDialog({
  open,
  mode,
  categories,
  category,
  defaultParentCategoryId = null,
  onOpenChange,
  onSuccess,
}: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryFormState>(() =>
    toFormState(category, defaultParentCategoryId),
  )
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(toFormState(category, defaultParentCategoryId))
      setErrorMsg(null)
      setSaving(false)
    }
  }, [open, category, defaultParentCategoryId])

  const parentOptions = useMemo(() => {
    const excluded = new Set<number>()
    if (category) {
      excluded.add(category.categoryId)
      for (const id of collectDescendantIds(categories, category.categoryId)) {
        excluded.add(id)
      }
    }

    return categories
      .filter((item) => !excluded.has(item.categoryId))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, category])

  const updateField = <K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "name" && mode === "create" && !prev.slugTouched) {
        next.slug = slugifyCategoryName(String(value))
      }
      if (key === "slug") {
        next.slugTouched = true
      }
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMsg(null)

    const name = form.name.trim()
    if (!name) {
      setErrorMsg("Category name is required.")
      return
    }

    const displayOrder = Number.parseInt(form.displayOrder, 10)
    if (Number.isNaN(displayOrder)) {
      setErrorMsg("Display order must be a number.")
      return
    }

    const parentCategoryId =
      form.parentCategoryId === "" ? null : Number.parseInt(form.parentCategoryId, 10)

    if (form.parentCategoryId !== "" && Number.isNaN(parentCategoryId)) {
      setErrorMsg("Invalid parent category.")
      return
    }

    setSaving(true)

    try {
      if (mode === "create") {
        const payload: CreateCategoryRequest = {
          name,
          slug: form.slug.trim() || null,
          description: form.description.trim() || null,
          iconClass: form.iconClass.trim() || null,
          displayOrder,
          parentCategoryId,
          isRestricted: form.isRestricted,
          isPostingAllowed: form.isPostingAllowed,
          isActive: form.isActive,
        }
        const created = await createCategory(payload)
        onSuccess(created)
        onOpenChange(false)
      } else if (category) {
        const slug = form.slug.trim() || slugifyCategoryName(name)
        if (!slug) {
          setErrorMsg("A valid slug is required.")
          setSaving(false)
          return
        }

        const payload: UpdateCategoryRequest = {
          name,
          slug,
          description: form.description.trim() || null,
          iconClass: form.iconClass.trim() || null,
          displayOrder,
          parentCategoryId,
          isRestricted: form.isRestricted,
          isPostingAllowed: form.isPostingAllowed,
          isActive: form.isActive,
        }
        const updated = await updateCategory(category.categoryId, payload)
        onSuccess(updated)
        onOpenChange(false)
      }
    } catch (error: unknown) {
      setErrorMsg(
        getApiErrorMessage(
          error,
          mode === "create" ? "Failed to create category." : "Failed to update category.",
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a category so posts have a clear home. Put it under a parent category if you need subgroups."
              : "Change this category's name, parent, visibility, or other details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Computer Studies"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="auto-generated-from-name"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-parent">Parent category</Label>
            <select
              id="category-parent"
              value={form.parentCategoryId}
              onChange={(e) => updateField("parentCategoryId", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">None (root category)</option>
              {parentOptions.map((item) => (
                <option key={item.categoryId} value={item.categoryId}>
                  {item.name}
                  {!item.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Optional short description"
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category-icon">Icon class</Label>
              <Input
                id="category-icon"
                value={form.iconClass}
                onChange={(e) => updateField("iconClass", e.target.value)}
                placeholder="optional"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-order">Display order</Label>
              <Input
                id="category-order"
                type="number"
                value={form.displayOrder}
                onChange={(e) => updateField("displayOrder", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isRestricted}
                onCheckedChange={(checked) =>
                  updateField("isRestricted", checked === true)
                }
              />
              Restricted (students+ only)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isPostingAllowed}
                onCheckedChange={(checked) =>
                  updateField("isPostingAllowed", checked === true)
                }
              />
              Allow posting
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(checked) => updateField("isActive", checked === true)}
              />
              Active
            </label>
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive" role="alert">
              {errorMsg}
            </p>
          )}

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
              {saving && <Loader2 className="size-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
