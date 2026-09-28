import axios from 'axios'
import type {
  AdminLogin,
  AdminToken,
  AdminCreate,
  AdminResponse,
  Profile,
  ProfileUpdate,
  Experience,
  ExperienceCreate,
  ExperienceUpdate,
  Education,
  EducationCreate,
  EducationUpdate,
  Project,
  ProjectCreate,
  ProjectUpdate,
  Skill,
  SkillCreate,
  SkillUpdate,
  Certification,
  CertificationCreate,
  CertificationUpdate,
  Achievement,
  AchievementCreate,
  AchievementUpdate,
  SocialLink,
  SocialLinkCreate,
  SocialLinkUpdate,
  MusicTrack,
  MusicCreate,
  MusicUpdate,
  SiteSettings,
  SiteSettingsUpdate,
  ContactMessage,
  MessageResponse,
  MediaObject,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL 

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  signup: (data: AdminCreate) =>
    api.post<AdminResponse>('/auth/signup', data).then((r) => r.data),
  login: (data: AdminLogin) =>
    api.post<AdminToken>('/auth/login', data).then((r) => r.data),
  getMe: () => api.get<{ message: string; success: boolean }>('/auth/me').then((r) => r.data),
}

export const profileApi = {
  get: () => api.get<Profile>('/admin/profile').then((r) => r.data),
  update: (data: ProfileUpdate) =>
    api.put<Profile>('/admin/profile', data).then((r) => r.data),
}

export const experienceApi = {
  getAll: () => api.get<Experience[]>('/admin/experiences').then((r) => r.data),
  getById: (id: string) =>
    api.get<Experience>(`/admin/experiences/${id}`).then((r) => r.data),
  create: (data: ExperienceCreate) =>
    api.post<Experience>('/admin/experiences', data).then((r) => r.data),
  update: (id: string, data: ExperienceUpdate) =>
    api.put<Experience>(`/admin/experiences/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/experiences/${id}`).then((r) => r.data),
}

export const educationApi = {
  getAll: () => api.get<Education[]>('/admin/education').then((r) => r.data),
  getById: (id: string) =>
    api.get<Education>(`/admin/education/${id}`).then((r) => r.data),
  create: (data: EducationCreate) =>
    api.post<Education>('/admin/education', data).then((r) => r.data),
  update: (id: string, data: EducationUpdate) =>
    api.put<Education>(`/admin/education/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/education/${id}`).then((r) => r.data),
}

export const projectApi = {
  getAll: () => api.get<Project[]>('/admin/projects').then((r) => r.data),
  getById: (id: string) =>
    api.get<Project>(`/admin/projects/${id}`).then((r) => r.data),
  create: (data: ProjectCreate) =>
    api.post<Project>('/admin/projects', data).then((r) => r.data),
  update: (id: string, data: ProjectUpdate) =>
    api.put<Project>(`/admin/projects/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/projects/${id}`).then((r) => r.data),
}

export const skillApi = {
  getAll: () => api.get<Skill[]>('/admin/skills').then((r) => r.data),
  getById: (id: string) =>
    api.get<Skill>(`/admin/skills/${id}`).then((r) => r.data),
  create: (data: SkillCreate) =>
    api.post<Skill>('/admin/skills', data).then((r) => r.data),
  update: (id: string, data: SkillUpdate) =>
    api.put<Skill>(`/admin/skills/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/skills/${id}`).then((r) => r.data),
}

export const certificationApi = {
  getAll: () => api.get<Certification[]>('/admin/certifications').then((r) => r.data),
  getById: (id: string) =>
    api.get<Certification>(`/admin/certifications/${id}`).then((r) => r.data),
  create: (data: CertificationCreate) =>
    api.post<Certification>('/admin/certifications', data).then((r) => r.data),
  update: (id: string, data: CertificationUpdate) =>
    api.put<Certification>(`/admin/certifications/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/certifications/${id}`).then((r) => r.data),
}

export const achievementApi = {
  getAll: () => api.get<Achievement[]>('/admin/achievements').then((r) => r.data),
  getById: (id: string) =>
    api.get<Achievement>(`/admin/achievements/${id}`).then((r) => r.data),
  create: (data: AchievementCreate) =>
    api.post<Achievement>('/admin/achievements', data).then((r) => r.data),
  update: (id: string, data: AchievementUpdate) =>
    api.put<Achievement>(`/admin/achievements/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/achievements/${id}`).then((r) => r.data),
}

export const socialApi = {
  getAll: () => api.get<SocialLink[]>('/admin/social-links').then((r) => r.data),
  getById: (id: string) =>
    api.get<SocialLink>(`/admin/social-links/${id}`).then((r) => r.data),
  create: (data: SocialLinkCreate) =>
    api.post<SocialLink>('/admin/social-links', data).then((r) => r.data),
  update: (id: string, data: SocialLinkUpdate) =>
    api.put<SocialLink>(`/admin/social-links/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/social-links/${id}`).then((r) => r.data),
}

export const musicApi = {
  getAll: () => api.get<MusicTrack[]>('/admin/music').then((r) => r.data),
  getById: (id: string) =>
    api.get<MusicTrack>(`/admin/music/${id}`).then((r) => r.data),
  create: (data: MusicCreate) =>
    api.post<MusicTrack>('/admin/music', data).then((r) => r.data),
  update: (id: string, data: MusicUpdate) =>
    api.put<MusicTrack>(`/admin/music/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/music/${id}`).then((r) => r.data),
}

export const settingsApi = {
  get: () => api.get<SiteSettings>('/admin/settings').then((r) => r.data),
  update: (data: SiteSettingsUpdate) =>
    api.put<SiteSettings>('/admin/settings', data).then((r) => r.data),
}

export const messageApi = {
  getAll: () => api.get<ContactMessage[]>('/admin/messages').then((r) => r.data),
  getById: (id: string) =>
    api.get<ContactMessage>(`/admin/messages/${id}`).then((r) => r.data),
  markRead: (id: string) =>
    api.put<ContactMessage>(`/admin/messages/${id}/read`).then((r) => r.data),
  delete: (id: string) =>
    api.delete<MessageResponse>(`/admin/messages/${id}`).then((r) => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>('/admin/messages/unread-count').then((r) => r.data),
}

export const mediaApi = {
  upload: (file: File, folder = 'portfolio', alt = '') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('alt', alt)
    return api
      .post<MediaObject>('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  delete: (fileId: string) =>
    api.delete<MessageResponse>(`/media/${fileId}`).then((r) => r.data),
  getUrl: (fileId: string) => `${API_BASE_URL}/api/v1/media/${fileId}`,
}

export default api
