import type { MediaObject } from './api'

export interface Profile {
  id: string
  name: string
  headline: string
  short_bio: string
  about: string
  profile_image?: MediaObject
  resume?: MediaObject
  location: string
  email: string
  phone: string
  resume_url: string
  availability: boolean
}

export interface ProfileUpdate {
  name?: string
  headline?: string
  short_bio?: string
  about?: string
  profile_image?: MediaObject
  resume?: MediaObject
  location?: string
  email?: string
  phone?: string
  resume_url?: string
  availability?: boolean
}
