import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  GraduationCap,
  FolderKanban,
  Code2,
  Award,
  Trophy,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'
import {
  experienceApi,
  educationApi,
  projectApi,
  skillApi,
  certificationApi,
  achievementApi,
  messageApi,
} from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/shared/loading-spinner'

interface Stats {
  experiences: number
  education: number
  projects: number
  skills: number
  certifications: number
  achievements: number
  unreadMessages: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const [exp, edu, proj, skills, certs, achs, unread] = await Promise.allSettled([
        experienceApi.getAll(),
        educationApi.getAll(),
        projectApi.getAll(),
        skillApi.getAll(),
        certificationApi.getAll(),
        achievementApi.getAll(),
        messageApi.getUnreadCount(),
      ])

      setStats({
        experiences: exp.status === 'fulfilled' ? exp.value.length : 0,
        education: edu.status === 'fulfilled' ? edu.value.length : 0,
        projects: proj.status === 'fulfilled' ? proj.value.length : 0,
        skills: skills.status === 'fulfilled' ? skills.value.length : 0,
        certifications: certs.status === 'fulfilled' ? certs.value.length : 0,
        achievements: achs.status === 'fulfilled' ? achs.value.length : 0,
        unreadMessages: unread.status === 'fulfilled' ? unread.value.count : 0,
      })
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (isLoading) return <LoadingSpinner />

  const statCards = [
    { label: 'Experiences', value: stats?.experiences ?? 0, icon: Briefcase, to: '/experience', color: 'text-blue-500' },
    { label: 'Education', value: stats?.education ?? 0, icon: GraduationCap, to: '/education', color: 'text-purple-500' },
    { label: 'Projects', value: stats?.projects ?? 0, icon: FolderKanban, to: '/projects', color: 'text-green-500' },
    { label: 'Skills', value: stats?.skills ?? 0, icon: Code2, to: '/skills', color: 'text-orange-500' },
    { label: 'Certifications', value: stats?.certifications ?? 0, icon: Award, to: '/certifications', color: 'text-yellow-500' },
    { label: 'Achievements', value: stats?.achievements ?? 0, icon: Trophy, to: '/achievements', color: 'text-red-500' },
  ]

  const quickActions = [
    { label: 'Add Experience', to: '/experience', icon: Briefcase },
    { label: 'Add Skill', to: '/skills', icon: Code2 },
    { label: 'Add Project', to: '/projects', icon: FolderKanban },
    { label: 'View Messages', to: '/messages', icon: MessageSquare, badge: stats?.unreadMessages },
    { label: 'Edit Profile', to: '/profile', icon: Briefcase },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here's an overview of your portfolio.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center justify-between p-3 sm:p-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{card.value}</p>
                </div>
                <card.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${card.color}`} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-base font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{action.label}</span>
                    {action.badge !== undefined && action.badge > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-base font-semibold text-foreground mb-3">Portfolio Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Profile completed', done: (stats?.experiences ?? 0) > 0 && (stats?.skills ?? 0) > 0 },
                { label: 'Experiences added', done: (stats?.experiences ?? 0) > 0 },
                { label: 'Education added', done: (stats?.education ?? 0) > 0 },
                { label: 'Projects added', done: (stats?.projects ?? 0) > 0 },
                { label: 'Skills added', done: (stats?.skills ?? 0) > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge variant={item.done ? 'default' : 'outline'}>
                    {item.done ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
