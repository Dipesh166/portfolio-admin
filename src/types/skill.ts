import type { MediaObject } from './api'

export interface Skill {
  id: string
  name: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  icon: string
  image?: MediaObject
  display_order: number
}

export interface SkillCreate {
  name: string
  category: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  icon?: string
  image?: MediaObject
  display_order?: number
}

export type SkillUpdate = Partial<SkillCreate>