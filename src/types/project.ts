import type { MediaObject } from './api'

export interface Project {
  id: string
  title: string
  slug: string
  short_description: string
  description: string
  thumbnail?: MediaObject
  images: MediaObject[]
  technologies: string[]
  github_url: string
  live_url: string
  featured: boolean
  status: 'completed' | 'in_progress' | 'planned'
  display_order: number
}

export interface ProjectCreate {
  title: string
  slug: string
  short_description?: string
  description?: string
  thumbnail?: MediaObject
  images?: MediaObject[]
  technologies?: string[]
  github_url?: string
  live_url?: string
  featured?: boolean
  status?: 'completed' | 'in_progress' | 'planned'
  display_order?: number
}

export type ProjectUpdate = Partial<ProjectCreate>
