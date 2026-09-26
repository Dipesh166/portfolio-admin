export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  url: string
  icon: string
  display_order: number
}

export interface AchievementCreate {
  title: string
  description?: string
  date?: string
  url?: string
  icon?: string
  display_order?: number
}

export type AchievementUpdate = Partial<AchievementCreate>
