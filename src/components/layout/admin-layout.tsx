import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import Topbar from './topbar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
