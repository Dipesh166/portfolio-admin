import type { MediaObject } from './api'

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  start_date: string
  end_date?: string
  description: string
  grade: string
  location: string
  logo?: MediaObject
  display_order: number
}

export interface EducationCreate {
  institution: string
  degree: string
  field?: string
  start_date: string
  end_date?: string
  description?: string
  grade?: string
  location?: string
  logo?: MediaObject
  display_order?: number
}

export type EducationUpdate = Partial<EducationCreate>
