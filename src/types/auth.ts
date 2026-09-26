export interface AdminLogin {
  email: string
  password: string
}

export interface AdminToken {
  access_token: string
  token_type: string
}

export interface AdminResponse {
  id: string
  email: string
  full_name: string
  is_active: boolean
}
