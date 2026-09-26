import type { MediaObject } from './api'

export interface Experience {
  id: string
  company: string
  position: string
  employment_type: string
  location: string
  start_date: string
  end_date?: string
  is_current: boolean
  description: string
  technologies: string[]
  company_url: string
  logo?: MediaObject
  display_order: number
}

export interface ExperienceCreate {
  company: string
  position: string
  employment_type?: string
  location?: string
  start_date: string
  end_date?: string
  is_current?: boolean
  description?: string
  technologies?: string[]
  company_url?: string
  logo?: MediaObject
  display_order?: number
}

export type ExperienceUpdate = Partial<ExperienceCreate>
