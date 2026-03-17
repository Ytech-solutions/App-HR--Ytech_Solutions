"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "./types"
import { mockUsers } from "./data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const rolePermissions: Record<UserRole, string[]> = {
  IT: [
    "view_employees",
    "add_employee",
    "edit_employee",
    "delete_employee",
    "view_dashboard_admin",
    "manage_accounts",
    "manage_departments",
    "manage_system",
  ],
  RH: [
    "view_employees",
    "add_employee",
    "edit_employee",
    "view_dashboard_rh",
    "manage_departments",
  ],
  CEO: [
    "view_employees",
    "view_dashboard_ceo",
    "manage_accounts",
  ],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier la session au chargement du composant
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        // Session check error
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      // Login error
      return false
    }
  }

  const logout = () => {
    setUser(null)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return rolePermissions[user.role].includes(permission)
  }

  const getCurrentUser = () => {
    return user
  }

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const user = getCurrentUser()
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          userId: user.id
        }),
      })

      if (response.ok) {
        // Forcer la déconnexion après changement de mot de passe
        await logout()
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      // Erreur lors du changement de mot de passe
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
        updatePassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
