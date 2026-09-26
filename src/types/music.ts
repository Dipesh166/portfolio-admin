import type { MediaObject } from './api'

export interface MusicTrack {
  id: string
  title: string
  artist: string
  audio?: MediaObject
  cover_image?: MediaObject
  display_order: number
  enabled: boolean
}

export interface MusicCreate {
  title: string
  artist?: string
  audio?: MediaObject
  cover_image?: MediaObject
  display_order?: number
  enabled?: boolean
}

export type MusicUpdate = Partial<MusicCreate>