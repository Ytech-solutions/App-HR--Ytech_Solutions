"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "./sidebar"
import { EmployeesList } from "./employees-list"
import { RHEmployeesList } from "./rh-employees-list"
import { EnhancedAccountManager } from "./enhanced-account-manager"
import { EnhancedSettingsPanel } from "./enhanced-settings-panel"
import { UnifiedDashboard } from "./unified-dashboard"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardLayout() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark:bg-slate-900', 'dark:text-slate-50')
    }
  }, [])

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const sidebar = document.getElementById('mobile-sidebar')
      
      if (window.innerWidth < 768 && sidebarOpen && 
          sidebar && !sidebar.contains(target) && 
          !target.closest('[data-sidebar-toggle]')) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <UnifiedDashboard />
      case "employees":
        // Use different employee lists based on user role
        if (user?.role === "ADMIN") {
          return <EmployeesList />
        } else {
          return <RHEmployeesList />
        }
      case "accounts":
        return <EnhancedAccountManager />
      case "settings":
        return <EnhancedSettingsPanel />
      default:
        return <UnifiedDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 md:flex">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          data-sidebar-toggle
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background border-border"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <main className="p-4 md:p-8 transition-colors duration-200 pt-16 md:pt-8 flex-1">
        {renderView()}
      </main>
    </div>
  )
}
