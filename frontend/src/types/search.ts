import type { Category } from "@/types/category"
import type { PagedPostsResponse, Post } from "@/types/post"
import type { PagedProfilesResponse, Profile } from "@/types/user"

export interface SearchResultsResponse {
  query: string
  posts: Post[]
  categories: Category[]
  profiles: Profile[]
}

export interface SearchPostsParams {
  q?: string
  categoryId?: number
  parentPostId?: number
  page?: number
  pageSize?: number
}

export interface SearchCategoriesParams {
  q?: string
  parentCategoryId?: number
}

export interface SearchProfilesParams {
  q?: string
  page?: number
  pageSize?: number
}

export type { PagedPostsResponse, PagedProfilesResponse }
