export interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  display_order: number
  enabled: boolean
}

export interface SocialLinkCreate {
  platform: string
  url: string
  icon?: string
  display_order?: number
  enabled?: boolean
}

export type SocialLinkUpdate = Partial<SocialLinkCreate>
