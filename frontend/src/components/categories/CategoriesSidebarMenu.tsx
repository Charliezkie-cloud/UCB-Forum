import { useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  ArrowRight,
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import {
  buildCategoryTree,
  collectExpandableIds,
  getApiErrorMessage,
} from "@/lib/categories"
import { isModeratorOrAdmin } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Category, CategoryTreeNode } from "@/types"

function CategoryMenuSubTree({
  node,
  depth,
  activeSlug,
  canManage,
  expandedIds,
  onToggle,
  onCreateChild,
  onEdit,
  onDelete,
}: {
  node: CategoryTreeNode
  depth: number
  activeSlug?: string | null
  canManage: boolean
  expandedIds: Set<number>
  onToggle: (categoryId: number) => void
  onCreateChild: (parent: Category) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedIds.has(node.categoryId)
  const isActive = activeSlug === node.slug

  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(!node.isActive && "opacity-50 line-through")}
        >
          <Link to={`/categories/${node.slug}`} title={node.description ?? node.name}>
            <CategoryLucideIcon iconClass={node.iconClass} className="size-4 shrink-0" />
            <span>{node.name}</span>
            {node.isRestricted && (
              <Badge variant="outline" className="ml-auto h-4 shrink-0 px-1 text-[9px]">
                Restricted
              </Badge>
            )}
            {!node.isPostingAllowed && (
              <Badge
                variant="outline"
                className={cn(
                  "h-4 shrink-0 px-1 text-[9px]",
                  node.isRestricted ? "ml-1" : "ml-auto",
                )}
              >
                No posting
              </Badge>
            )}
          </Link>
        </SidebarMenuButton>

        {hasChildren && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-8 top-1 size-6 text-muted-foreground opacity-0 transition-opacity group-hover/menu-item:opacity-100"
            onClick={() => onToggle(node.categoryId)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        )}

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover/menu-item:opacity-100 data-[state=open]:opacity-100"
                aria-label={`Manage ${node.name}`}
              >
                <MoreHorizontal className="size-3.5" />
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

        {hasChildren && isExpanded && (
          <SidebarMenuSub>
            {node.children.map((child) => (
              <CategoryMenuSubTree
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
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  // depth > 0: render as a sub-button row
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={isActive}
        className={cn(!node.isActive && "opacity-50 line-through")}
      >
        <Link to={`/categories/${node.slug}`} title={node.description ?? node.name}>
          <CategoryLucideIcon iconClass={node.iconClass} className="size-3.5 shrink-0" />
          <span>{node.name}</span>
          {node.isRestricted && (
            <Badge variant="outline" className="ml-auto h-4 shrink-0 px-1 text-[9px]">
              Restricted
            </Badge>
          )}
          {!node.isPostingAllowed && (
            <Badge
              variant="outline"
              className={cn(
                "h-4 shrink-0 px-1 text-[9px]",
                node.isRestricted ? "ml-1" : "ml-auto",
              )}
            >
              No posting
            </Badge>
          )}
        </Link>
      </SidebarMenuSubButton>

      {hasChildren && isExpanded && (
        <SidebarMenuSub>
          {node.children.map((child) => (
            <CategoryMenuSubTree
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
        </SidebarMenuSub>
      )}
    </SidebarMenuSubItem>
  )
}

interface CategoriesSidebarMenuProps {
  className?: string
}

export function CategoriesSidebarMenu({ className }: CategoriesSidebarMenuProps = {}) {
  const { pathname } = useLocation()
  const activeSlug = pathname.startsWith("/categories/")
    ? pathname.split("/")[2] ?? null
    : null
  const { user } = useAuth()
  const canManage = isModeratorOrAdmin(user?.userRoleCode)

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
      <SidebarProvider
        className={cn("min-h-0 w-full", className)}
        style={{ "--sidebar-width": "100%" } as React.CSSProperties}
      >
        <Sidebar
          collapsible="none"
          className="w-full rounded-xl border border-border/80 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FolderTree className="size-4 text-primary" />
              Categories
            </span>
            {canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => openCreate(null)}
                aria-label="Create category"
              >
                <Plus className="size-4" />
              </Button>
            )}
          </div>

          {!loading && tree.length > 0 && (
            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 flex-1 gap-1.5 text-xs"
                onClick={expandAll}
              >
                <ChevronsDownUp className="size-3.5" />
                Expand all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 flex-1 gap-1.5 text-xs"
                onClick={collapseAll}
              >
                <ChevronsUpDown className="size-3.5" />
                Collapse all
              </Button>
            </div>
          )}

          <SidebarContent className="overflow-y-auto">
            <SidebarGroup className="p-2">
              {loading ? (
                <SidebarMenu>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : errorMsg && categories.length === 0 ? (
                <div className="space-y-3 py-4 text-center">
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
                    <p className="mb-2 px-2 text-xs text-destructive" role="alert">
                      {errorMsg}
                    </p>
                  )}

                  {tree.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No categories yet.
                      {canManage ? " Create one to get started." : ""}
                    </p>
                  ) : (
                    <SidebarMenu>
                      {tree.map((node) => (
                        <CategoryMenuSubTree
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
                    </SidebarMenu>
                  )}

                  {deletingId != null && (
                    <p className="mt-2 flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      Deactivating...
                    </p>
                  )}
                </>
              )}
            </SidebarGroup>
          </SidebarContent>

          {!loading && tree.length > 0 && (
            <>
              <SidebarSeparator />
              <SidebarFooter className="p-3">
                <Link
                  to="/categories"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  View all categories
                  <ArrowRight className="size-3.5" />
                </Link>
              </SidebarFooter>
            </>
          )}
        </Sidebar>
      </SidebarProvider>

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
