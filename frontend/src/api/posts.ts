import apiClient from "@/api/client"
import type {
  CreatePostRequest,
  GetPostsParams,
  LikePostResponse,
  PagedPostsResponse,
  Post,
  UpdatePostRequest,
} from "@/types"

export async function getPosts(params: GetPostsParams = {}): Promise<PagedPostsResponse> {
  const response = await apiClient.get<PagedPostsResponse>("/posts", {
    params: {
      categoryId: params.categoryId,
      parentPostId: params.parentPostId ?? undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  })
  return response.data
}

export async function getLatestPosts(params: {
  page?: number
  pageSize?: number
} = {}): Promise<PagedPostsResponse> {
  const response = await apiClient.get<PagedPostsResponse>("/posts/latest", {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  })
  return response.data
}

export async function getPostById(postId: number): Promise<Post> {
  const response = await apiClient.get<Post>(`/posts/${postId}`)
  return response.data
}

export async function createPost(payload: CreatePostRequest): Promise<Post> {
  const response = await apiClient.post<Post>("/posts", payload)
  return response.data
}

export async function updatePost(
  postId: number,
  payload: UpdatePostRequest,
): Promise<Post> {
  const response = await apiClient.put<Post>(`/posts/${postId}`, payload)
  return response.data
}

export async function deletePost(postId: number): Promise<void> {
  await apiClient.delete(`/posts/${postId}`)
}

export async function likePost(postId: number): Promise<LikePostResponse> {
  const response = await apiClient.post<LikePostResponse>(`/posts/${postId}/like`)
  return response.data
}

export async function unlikePost(postId: number): Promise<LikePostResponse> {
  const response = await apiClient.delete<LikePostResponse>(`/posts/${postId}/like`)
  return response.data
}
