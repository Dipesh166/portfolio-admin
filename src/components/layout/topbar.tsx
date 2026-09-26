import { useAuth } from '@/contexts/auth-context'
import { useLocation } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import DarkModeToggle from '@/components/shared/dark-mode-toggle'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/profile': 'Profile',
  '/experience': 'Experience',
  '/education': 'Education',
  '/projects': 'Projects',
  '/skills': 'Skills',
  '/certifications': 'Certifications',
  '/achievements': 'Achievements',
  '/socials': 'Social Links',
  '/music': 'Music',
  '/messages': 'Messages',
  '/settings': 'Settings',
}

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { logout } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Admin'

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <DarkModeToggle />
        <button
          onClick={logout}
          className="hidden items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <button
          onClick={logout}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground sm:hidden"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
