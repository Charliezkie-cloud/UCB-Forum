import apiClient from "@/api/client"
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types"

export async function getCategories(parentCategoryId?: number | null): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories", {
    params:
      parentCategoryId === undefined || parentCategoryId === null
        ? undefined
        : { parentCategoryId },
  })
  return response.data
}

export async function getCategoryById(categoryId: number): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/${categoryId}`)
  return response.data
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/slug/${encodeURIComponent(slug)}`)
  return response.data
}

export async function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  const response = await apiClient.post<Category>("/categories", payload)
  return response.data
}

export async function updateCategory(
  categoryId: number,
  payload: UpdateCategoryRequest,
): Promise<Category> {
  const response = await apiClient.put<Category>(`/categories/${categoryId}`, payload)
  return response.data
}

export async function deactivateCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`)
}
