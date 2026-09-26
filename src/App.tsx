import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toast'
import AdminLayout from '@/components/layout/admin-layout'
import ProtectedRoute from '@/components/shared/protected-route'
import LoginPage from '@/pages/login-page'
import DashboardPage from '@/pages/dashboard-page'
import ProfilePage from '@/pages/profile-page'
import ExperiencePage from '@/pages/experience-page'
import EducationPage from '@/pages/education-page'
import SkillsPage from '@/pages/skills-page'
import ProjectsPage from '@/pages/projects-page'
import CertificationsPage from '@/pages/certifications-page'
import AchievementsPage from '@/pages/achievements-page'
import SocialsPage from '@/pages/socials-page'
import MusicPage from '@/pages/music-page'
import MessagesPage from '@/pages/messages-page'
import SettingsPage from '@/pages/settings-page'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/certifications" element={<CertificationsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/socials" element={<SocialsPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}
