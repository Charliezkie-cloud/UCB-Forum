import apiClient from "@/api/client"
import type {
  Category,
  PagedPostsResponse,
  PagedProfilesResponse,
  SearchCategoriesParams,
  SearchPostsParams,
  SearchProfilesParams,
  SearchResultsResponse,
} from "@/types"

export async function searchAll(
  query?: string,
  limit: number = 5,
  signal?: AbortSignal,
): Promise<SearchResultsResponse> {
  const response = await apiClient.get<SearchResultsResponse>("/search", {
    params: {
      q: query?.trim() ? query.trim() : undefined,
      limit,
    },
    signal,
  })
  return response.data
}

export async function searchPosts(
  params: SearchPostsParams = {},
  signal?: AbortSignal,
): Promise<PagedPostsResponse> {
  const response = await apiClient.get<PagedPostsResponse>("/search/posts", {
    params: {
      q: params.q?.trim() ? params.q.trim() : undefined,
      categoryId: params.categoryId,
      parentPostId: params.parentPostId ?? undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
    signal,
  })
  return response.data
}

export async function searchCategories(
  params: SearchCategoriesParams = {},
  signal?: AbortSignal,
): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/search/categories", {
    params: {
      q: params.q?.trim() ? params.q.trim() : undefined,
      parentCategoryId: params.parentCategoryId ?? undefined,
    },
    signal,
  })
  return response.data
}

export async function searchProfiles(
  params: SearchProfilesParams = {},
  signal?: AbortSignal,
): Promise<PagedProfilesResponse> {
  const response = await apiClient.get<PagedProfilesResponse>("/search/profiles", {
    params: {
      q: params.q?.trim() ? params.q.trim() : undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
    signal,
  })
  return response.data
}
