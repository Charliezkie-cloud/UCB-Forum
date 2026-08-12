import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  FolderTree,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { deactivateCategory, getCategories } from "@/api/categories"
import { CategoryLucideIcon } from "@/components/categories/CategoryLucideIcon"
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import {
  buildCategoryTree,
  collectExpandableIds,
  getApiErrorMessage,
} from "@/lib/categories"
import { USER_ROLE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Category, CategoryTreeNode } from "@/types"

interface CategoryTreeItemProps {
  node: CategoryTreeNode
  depth: number
  activeSlug?: string | null
  canManage: boolean
  expandedIds: Set<number>
  onToggle: (categoryId: number) => void
  onCreateChild: (parent: Category) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function CategoryTreeItem({
  node,
  depth,
  activeSlug,
  canManage,
  expandedIds,
  onToggle,
  onCreateChild,
  onEdit,
  onDelete,
}: CategoryTreeItemProps) {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedIds.has(node.categoryId)
  const isActive = activeSlug === node.slug

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg border border-transparent px-1 py-0.5 transition-colors hover:border-border/60 hover:bg-muted/30",
          isActive && "border-border/80 bg-secondary/60",
        )}
        style={{ paddingLeft: `${Math.min(depth, 6) * 16 + 4}px` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(
            "size-7 shrink-0 text-muted-foreground",
            !hasChildren && "invisible",
          )}
          onClick={() => onToggle(node.categoryId)}
          aria-label={isExpanded ? "Collapse category" : "Expand category"}
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>

        <Link
          to={`/categories/${node.slug}`}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors",
            !node.isActive && "text-muted-foreground/70",
            isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground",
          )}
          title={node.description ?? node.name}
        >
          <CategoryLucideIcon
            iconClass={node.iconClass}
            className="size-4 shrink-0 text-primary/80"
          />
          <span className="truncate">{node.name}</span>
          {node.isRestricted && (
            <Badge variant="outline" className="ml-1 h-5 shrink-0 px-1.5 text-[10px]">
              Restricted
            </Badge>
          )}
          {!node.isActive && canManage && (
            <Badge variant="outline" className="ml-1 h-5 shrink-0 px-1.5 text-[10px] line-through">
              Inactive
            </Badge>
          )}
        </Link>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-7 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                aria-label={`Manage ${node.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onCreateChild(node)}>
                <Plus className="size-3.5" />
                Add subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(node)}>
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(node)}
                disabled={!node.isActive}
              >
                <Trash2 className="size-3.5" />
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {node.description && (
        <p
          className="truncate text-xs text-muted-foreground/80"
          style={{ paddingLeft: `${Math.min(depth, 6) * 16 + 52}px` }}
        >
          {node.description}
        </p>
      )}

      {hasChildren && isExpanded && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.categoryId}
              node={child}
              depth={depth + 1}
              activeSlug={activeSlug}
              canManage={canManage}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onCreateChild={onCreateChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CategoriesTreePanelProps {
  activeSlug?: string | null
}

export function CategoriesTreePanel({ activeSlug = null }: CategoriesTreePanelProps) {
  const { user } = useAuth()
  const canManage =
    user?.userRoleCode === USER_ROLE.Moderator ||
    user?.userRoleCode === USER_ROLE.Admin

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [defaultParentCategoryId, setDefaultParentCategoryId] = useState<number | null>(
    null,
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const tree = useMemo(() => buildCategoryTree(categories), [categories])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const data = await getCategories()
      setCategories(data)
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, "Failed to load categories."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  useEffect(() => {
    if (!activeSlug || categories.length === 0) return

    const active = categories.find((c) => c.slug === activeSlug)
    if (!active) return

    const ancestorIds = new Set<number>()
    let current = active
    while (current.parentCategoryId != null) {
      ancestorIds.add(current.parentCategoryId)
      const parent = categories.find((c) => c.categoryId === current.parentCategoryId)
      if (!parent) break
      current = parent
    }

    setExpandedIds((prev) => new Set([...prev, ...ancestorIds]))
  }, [activeSlug, categories])

  const toggleExpanded = (categoryId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(collectExpandableIds(tree)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const openCreate = (parentCategoryId: number | null = null) => {
    setFormMode("create")
    setEditingCategory(null)
    setDefaultParentCategoryId(parentCategoryId)
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setFormMode("edit")
    setEditingCategory(category)
    setDefaultParentCategoryId(category.parentCategoryId)
    setFormOpen(true)
  }

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"? It will be hidden from regular users.`,
    )
    if (!confirmed) return

    try {
      setDeletingId(category.categoryId)
      setErrorMsg(null)
      await deactivateCategory(category.categoryId)
      setCategories((prev) =>
        prev.map((item) =>
          item.categoryId === category.categoryId ? { ...item, isActive: false } : item,
        ),
      )
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, "Failed to deactivate category."))
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSuccess = (saved: Category) => {
    setCategories((prev) => {
      const exists = prev.some((item) => item.categoryId === saved.categoryId)
      if (exists) {
        return prev.map((item) =>
          item.categoryId === saved.categoryId ? saved : item,
        )
      }
      return [...prev, saved]
    })

    if (saved.parentCategoryId != null) {
      setExpandedIds((prev) => new Set(prev).add(saved.parentCategoryId!))
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={expandAll}
            disabled={loading || tree.length === 0}
          >
            <ChevronsDownUp className="size-3.5" />
            Expand all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={collapseAll}
            disabled={loading || tree.length === 0}
          >
            <ChevronsUpDown className="size-3.5" />
            Collapse all
          </Button>
        </div>

        {canManage && (
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-xs"
            onClick={() => openCreate(null)}
          >
            <Plus className="size-3.5" />
            New category
          </Button>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading categories…
          </div>
        ) : errorMsg && categories.length === 0 ? (
          <div className="space-y-3 py-8 text-center">
            <p className="text-sm text-destructive">{errorMsg}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadCategories()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {errorMsg && (
              <p className="mb-3 text-xs text-destructive" role="alert">
                {errorMsg}
              </p>
            )}

            {tree.length === 0 ? (
              <div className="py-16 text-center">
                <FolderTree className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No categories yet.
                  {canManage ? " Create one to get campus discussions started." : ""}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {tree.map((node) => (
                  <CategoryTreeItem
                    key={node.categoryId}
                    node={node}
                    depth={0}
                    activeSlug={activeSlug}
                    canManage={canManage}
                    expandedIds={expandedIds}
                    onToggle={toggleExpanded}
                    onCreateChild={(parent) => openCreate(parent.categoryId)}
                    onEdit={openEdit}
                    onDelete={(cat) => void handleDelete(cat)}
                  />
                ))}
              </div>
            )}

            {deletingId != null && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Deactivating…
              </p>
            )}
          </>
        )}
      </div>

      {canManage && (
        <CategoryFormDialog
          open={formOpen}
          mode={formMode}
          categories={categories}
          category={editingCategory}
          defaultParentCategoryId={defaultParentCategoryId}
          onOpenChange={setFormOpen}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  )
}
