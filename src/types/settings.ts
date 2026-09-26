export interface SEOSettings {
  meta_title: string
  meta_description: string
  og_image: string
  site_url: string
  google_analytics_id: string
}

export interface SiteSettings {
  id: string
  site_name: string
  site_tagline: string
  footer_text: string
  maintenance_mode: boolean
  seo: SEOSettings
}

export interface SiteSettingsUpdate {
  site_name?: string
  site_tagline?: string
  footer_text?: string
  maintenance_mode?: boolean
  seo?: Partial<SEOSettings>
}
