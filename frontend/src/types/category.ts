export interface Category {
  categoryId: number
  parentCategoryId: number | null
  createdAt: string
  name: string
  slug: string
  description: string | null
  iconClass: string | null
  displayOrder: number
  isRestricted: boolean
  isPostingAllowed: boolean
  isActive: boolean
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

export interface CreateCategoryRequest {
  parentCategoryId?: number | null
  name: string
  slug?: string | null
  description?: string | null
  iconClass?: string | null
  displayOrder?: number
  isRestricted?: boolean
  isPostingAllowed?: boolean
  isActive?: boolean
}

export interface UpdateCategoryRequest {
  parentCategoryId?: number | null
  name: string
  slug: string
  description?: string | null
  iconClass?: string | null
  displayOrder?: number
  isRestricted?: boolean
  isPostingAllowed?: boolean
  isActive?: boolean
}

export interface UpdateCategoryPostingAllowedRequest {
  isPostingAllowed: boolean
}
