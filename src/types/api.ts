export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  detail: string
  success: boolean
}

export interface MessageResponse {
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

export interface MediaObject {
  file_id: string
  url: string
  alt: string
  filename: string
  content_type: string
  size: number
}
