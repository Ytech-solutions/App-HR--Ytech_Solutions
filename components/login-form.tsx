"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { AlertCircle, Building2, Eye, EyeOff, Moon, Sun } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    setIsHydrated(true)
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(savedDarkMode)
    
    // Apply theme on load if dark mode is enabled
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark:bg-slate-900', 'dark:text-slate-50')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark:bg-slate-900', 'dark:text-slate-50')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark:bg-slate-900', 'dark:text-slate-50')
    }
  }

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "L'email n'est pas valide"
    }
    
    if (!password.trim()) {
      newErrors.password = "Le mot de passe est requis"
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }
    
    setErrors(newErrors)
    setError("")
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = await login(email, password)
    if (success) {
      // La connexion a réussi, on ne recharge plus la page
      // Le contexte va se mettre à jour automatiquement
    } else {
      setError("Email ou mot de passe incorrect")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      {!isHydrated ? (
        <div className="w-full max-w-md border-0 shadow-2xl">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg">
                  <Building2 className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Ytech RH</CardTitle>
                <CardDescription className="mt-2">
                  Chargement...
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1" />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Ytech RH</CardTitle>
              <CardDescription className="mt-2">
                Connectez-vous pour accéder au système
              </CardDescription>
            </div>
          </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: "" }))
                    }
                  }}
                  required
                  autoComplete="email"
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: "" }))
                      }
                    }}
                    required
                    autoComplete="current-password"
                    className={`h-11 pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
