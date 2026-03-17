"use client"

import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  Building2,
  LayoutDashboard,
  Users,
  LogOut,
  KeyRound,
  Settings,
  BarChart3,
  Building,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth()

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "IT":
        return "Administrateur"
      case "RH":
        return "Ressources Humaines"
      case "CEO":
        return "Directeur Général"
      default:
        return role
    }
  }

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: "employees",
      label: "Employés",
      icon: Users,
      show: hasPermission("view_employees"),
    },
    {
      id: "accounts",
      label: "Comptes",
      icon: KeyRound,
      show: hasPermission("manage_accounts"),
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      show: true,
    },
  ].filter((item) => item.show)

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 bg-sidebar-primary rounded-xl shadow-lg">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Ytech RH</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestion des employés</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  currentView === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-sidebar-accent/30">
          <Avatar className="h-10 w-10 ring-2 ring-sidebar-accent">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-medium">
              {user?.avatar || user?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-sidebar-accent text-sidebar-foreground/80">
              {getRoleLabel(user?.role || "")}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}
