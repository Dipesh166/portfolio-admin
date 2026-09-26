import type { MediaObject } from './api'

export interface Certification {
  id: string
  title: string
  issuer: string
  issue_date: string
  credential_id: string
  credential_url: string
  certificate_image?: MediaObject
  display_order: number
}

export interface CertificationCreate {
  title: string
  issuer: string
  issue_date: string
  credential_id?: string
  credential_url?: string
  certificate_image?: MediaObject
  display_order?: number
}

export type CertificationUpdate = Partial<CertificationCreate>
