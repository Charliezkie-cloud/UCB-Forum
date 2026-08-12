import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  FolderTree,
  Loader2,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { deactivateCategory, getCategories, getCategoryBySlug } from "@/api/categories"
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import {
  getApiErrorMessage,
  getCategoryAncestors,
  getCategoryChildren,
} from "@/lib/categories"
import { USER_ROLE } from "@/lib/constants"
import type { Category } from "@/types"

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const canManage =
    user?.userRoleCode === USER_ROLE.Moderator ||
    user?.userRoleCode === USER_ROLE.Admin

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("edit")
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategory() {
      if (!slug) {
        setErrorMsg("Invalid category slug.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setErrorMsg(null)
        const [categoryData, categoriesData] = await Promise.all([
          getCategoryBySlug(slug),
          getCategories(),
        ])
        setCategory(categoryData)
        setAllCategories(categoriesData)
      } catch (error: unknown) {
        setErrorMsg(getApiErrorMessage(error, "This category could not be found."))
        setCategory(null)
      } finally {
        setLoading(false)
      }
    }

    void loadCategory()
  }, [slug])

  const ancestors = useMemo(() => {
    if (!category) return []
    return getCategoryAncestors(allCategories, category.categoryId)
  }, [category, allCategories])

  const subcategories = useMemo(() => {
    if (!category) return []
    return getCategoryChildren(allCategories, category.categoryId)
  }, [category, allCategories])

  const handleFormSuccess = (saved: Category) => {
    setCategory(saved)
    setAllCategories((prev) => {
      const exists = prev.some((item) => item.categoryId === saved.categoryId)
      if (exists) {
        return prev.map((item) =>
          item.categoryId === saved.categoryId ? saved : item,
        )
      }
      return [...prev, saved]
    })

    if (saved.slug !== slug) {
      navigate(`/categories/${saved.slug}`, { replace: true })
    }
  }

  const handleDeactivate = async () => {
    if (!category) return

    const confirmed = window.confirm(
      `Deactivate "${category.name}"? It will be hidden from regular users.`,
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      setActionError(null)
      await deactivateCategory(category.categoryId)
      navigate("/categories", { replace: true })
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, "Failed to deactivate category."))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading category…</p>
      </div>
    )
  }

  if (!category || errorMsg) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Category not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {errorMsg || "We couldn't retrieve this category."}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link to="/categories">Browse all categories</Link>
          </Button>
        </div>
      </div>
    )
  }

  const createdDate = new Date(category.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link to="/categories" className="hover:text-foreground transition-colors">
          Categories
        </Link>
        {ancestors.map((ancestor) => (
          <span key={ancestor.categoryId} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              to={`/categories/${ancestor.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {ancestor.name}
            </Link>
          </span>
        ))}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative h-28 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/30 sm:h-36">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        </div>

        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10 sm:-mt-12">
            <div className="flex items-end gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md ring-4 ring-card sm:size-24">
                <FolderTree className="size-9 sm:size-10" />
              </div>
              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {category.name}
                  </h1>
                  {category.isRestricted && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    >
                      <Lock className="size-3" />
                      Restricted
                    </Badge>
                  )}
                  {!category.isActive && canManage && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-xs text-muted-foreground">/{category.slug}</p>
              </div>
            </div>

            {canManage && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setFormMode("create")
                    setFormOpen(true)
                  }}
                >
                  <Plus className="size-3.5" />
                  Add subcategory
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setFormMode("edit")
                    setFormOpen(true)
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                {category.isActive && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                    onClick={() => void handleDeactivate()}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Deactivate
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-muted/30 px-6 py-3.5 sm:px-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Created {createdDate}</span>
            {subcategories.length > 0 && (
              <span>
                {subcategories.length} subcategor{subcategories.length === 1 ? "y" : "ies"}
              </span>
            )}
          </div>
        </div>
      </div>

      {actionError && (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}

      {category.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MessageSquare className="size-4 text-primary" />
              <span>About this category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{category.description}</p>
          </CardContent>
        </Card>
      )}

      {subcategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FolderTree className="size-4 text-primary" />
              <span>Subcategories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.categoryId}
                  to={`/categories/${sub.slug}`}
                  className="group flex items-start gap-3 rounded-lg border border-border/80 bg-card p-3.5 transition-colors hover:border-primary/30 hover:bg-muted/30"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FolderTree className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 my-auto">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {sub.name}
                      </p>
                      {sub.isRestricted && (
                        <Badge variant="outline" className="h-4 shrink-0 px-1 text-[9px]">
                          Restricted
                        </Badge>
                      )}
                    </div>
                    {sub.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {sub.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="size-4 text-primary" />
            <span>Discussions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/20 py-12 text-center">
            <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Posts in this category will appear here.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              The post feed for "{category.name}" is coming soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {canManage && (
        <CategoryFormDialog
          open={formOpen}
          mode={formMode}
          categories={allCategories}
          category={formMode === "edit" ? category : null}
          defaultParentCategoryId={
            formMode === "create" ? category.categoryId : category.parentCategoryId
          }
          onOpenChange={setFormOpen}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
