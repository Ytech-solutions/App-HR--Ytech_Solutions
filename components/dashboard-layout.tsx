"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "./sidebar"
import { EmployeesList } from "./employees-list"
import { RHEmployeesList } from "./rh-employees-list"
import { EnhancedAccountManager } from "./enhanced-account-manager"
import { EnhancedSettingsPanel } from "./enhanced-settings-panel"
import { UnifiedDashboard } from "./unified-dashboard"

export function DashboardLayout() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark:bg-slate-900', 'dark:text-slate-50')
    }
  }, [])

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <UnifiedDashboard />
      case "employees":
        // Use different employee lists based on user role
        if (user?.role === "IT") {
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
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="ml-64 p-8 transition-colors duration-200">
        {renderView()}
      </main>
    </div>
  )
}
