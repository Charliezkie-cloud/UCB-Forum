import type { Category, CategoryTreeNode } from "@/types"
import axios from "axios"

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const nodes = new Map<number, CategoryTreeNode>()

  for (const category of categories) {
    nodes.set(category.categoryId, { ...category, children: [] })
  }

  const roots: CategoryTreeNode[] = []

  for (const node of nodes.values()) {
    if (node.parentCategoryId != null && nodes.has(node.parentCategoryId)) {
      nodes.get(node.parentCategoryId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (list: CategoryTreeNode[]) => {
    list.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder
      }
      return a.name.localeCompare(b.name)
    })
    for (const child of list) {
      sortNodes(child.children)
    }
  }

  sortNodes(roots)
  return roots
}

export function collectDescendantIds(
  categories: Category[],
  categoryId: number,
): Set<number> {
  const childrenByParent = new Map<number | null, Category[]>()

  for (const category of categories) {
    const parentKey = category.parentCategoryId
    const siblings = childrenByParent.get(parentKey) ?? []
    siblings.push(category)
    childrenByParent.set(parentKey, siblings)
  }

  const result = new Set<number>()
  const stack = [categoryId]

  while (stack.length > 0) {
    const currentId = stack.pop()!
    const children = childrenByParent.get(currentId) ?? []
    for (const child of children) {
      if (!result.has(child.categoryId)) {
        result.add(child.categoryId)
        stack.push(child.categoryId)
      }
    }
  }

  return result
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export function getCategoryChildren(
  categories: Category[],
  parentCategoryId: number,
): Category[] {
  return categories
    .filter((c) => c.parentCategoryId === parentCategoryId)
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder
      }
      return a.name.localeCompare(b.name)
    })
}

export function getCategoryAncestors(
  categories: Category[],
  categoryId: number,
): Category[] {
  const byId = new Map(categories.map((c) => [c.categoryId, c]))
  const ancestors: Category[] = []
  let current = byId.get(categoryId)

  while (current?.parentCategoryId != null) {
    const parent = byId.get(current.parentCategoryId)
    if (!parent) break
    ancestors.unshift(parent)
    current = parent
  }

  return ancestors
}

export function collectExpandableIds(tree: CategoryTreeNode[]): number[] {
  const ids: number[] = []

  const walk = (nodes: CategoryTreeNode[]) => {
    for (const node of nodes) {
      if (node.children.length > 0) {
        ids.push(node.categoryId)
        walk(node.children)
      }
    }
  }

  walk(tree)
  return ids
}

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
}
