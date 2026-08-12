export interface Post {
  postId: number
  categoryId: number
  categoryName: string
  categorySlug: string
  parentPostId: number | null
  authorId: number
  authorUsername: string
  createdAt: string
  updatedAt: string
  title: string | null
  content: string
  isPinned: boolean
  likesCount: number
  replyCount: number
  isLikedByCaller: boolean
  isDeleted: boolean
}

export interface PagedPostsResponse {
  items: Post[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CreatePostRequest {
  categoryId: number
  parentPostId?: number | null
  title?: string | null
  content: string
}

export interface UpdatePostRequest {
  title?: string | null
  content: string
}

export interface LikePostResponse {
  postId: number
  likesCount: number
  isLikedByCaller: boolean
}

export interface GetPostsParams {
  categoryId?: number
  parentPostId?: number | null
  page?: number
  pageSize?: number
}
