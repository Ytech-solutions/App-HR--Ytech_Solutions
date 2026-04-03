"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthUtils } from "@/lib/auth-utils"
import { PasswordStrengthBar } from "@/components/password-strength-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  History,
  ShieldCheck,
  Info,
  RefreshCw,
  Settings,
  Key,
  Bell,
  Palette,
  Globe,
  Smartphone,
  HelpCircle,
  LogOut,
  UserCheck,
  Building,
  Calendar,
  MapPin,
  Award,
  TrendingUp,
  FileText,
  Users
} from "lucide-react"

export function EnhancedSettingsPanel() {
  const { user, updatePassword, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [securityLogs, setSecurityLogs] = useState<any[]>([])
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false)
  const [passwordHistory, setPasswordHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (user?.id) {
      loadSecurityLogs()
    }
  }, [user])

  const loadSecurityLogs = async () => {
    setIsLoadingSecurity(true)
    try {
      const response = await fetch(`/api/auth/change-password?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setSecurityLogs(data.securityLogs || [])
        setPasswordHistory(data.passwordHistory || [])
      }
    } catch (error) {
      // Erreur lors du chargement des logs de sécurité
    } finally {
      setIsLoadingSecurity(false)
    }
  }

  const handlePasswordChange = async () => {
    setMessage(null)
    setIsLoading(true)

    try {
      // Validation des champs
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setMessage({ type: "error", text: "Tous les champs sont requis" })
        setIsLoading(false)
        return
      }

      // Validation de la correspondance des mots de passe
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas" })
        setIsLoading(false)
        return
      }

      // Validation avancée de la force du mot de passe
      const passwordValidation = AuthUtils.validatePasswordStrength(formData.newPassword)
      if (!passwordValidation.isValid) {
        setMessage({ type: "error", text: passwordValidation.message })
        setIsLoading(false)
        return
      }

      // Appeler l'API pour changer le mot de passe
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          userId: user?.id
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setMessage({ type: "success", text: "Mot de passe changé avec succès" })
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        
        // Recharger les logs de sécurité
        await loadSecurityLogs()
        
        // Déconnexion automatique après 2 secondes
        setTimeout(() => {
          logout()
          window.location.replace("/")
        }, 2000)
      } else {
        setMessage({ type: "error", text: data.error || "Une erreur est survenue lors de la mise à jour" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Une erreur est survenue lors de la mise à jour du mot de passe" })
    } finally {
      setIsLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'PASSWORD_CHANGE': return 'bg-blue-100 text-blue-800'
      case 'LOGIN': return 'bg-green-100 text-green-800'
      case 'LOGIN_FAILED': return 'bg-red-100 text-red-800'
      case 'LOGOUT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'PASSWORD_CHANGE': return 'Changement de mot de passe'
      case 'LOGIN': return 'Connexion'
      case 'LOGIN_FAILED': return 'Échec de connexion'
      case 'LOGOUT': return 'Déconnexion'
      default: return action
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN": return "Administrateur"
      case "RH": return "Ressources Humaines"
      case "EMPLOYE": return "Employe"
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-purple-100 text-purple-800 border-purple-200"
      case "RH": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "EMPLOYE": return "bg-amber-100 text-amber-800 border-amber-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "ADMIN":
        return [
          "Accès complet au système",
          "Gestion des employés",
          "Gestion des comptes",
          "Suppression de données",
          "Administration système",
          "Logs de sécurité"
        ]
      case "RH":
        return [
          "Gestion des employés",
          "Ajout d'employés",
          "Modification des profils",
          "Rapports RH",
          "Gestion des congés"
        ]
      case "EMPLOYE":
        return [
          "Lecture seule",
          "Profil personnel",
          "Consultation des informations"
        ]
      default:
        return ["Accès limité"]
    }
  }

  const canAccessSecurityLogs = user?.role === "ADMIN"
  const canManageAccount = ["ADMIN", "RH"].includes(user?.role || "")
  const canViewAdvancedSettings = user?.role === "ADMIN"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Paramètres</h1>
              <p className="text-sm text-gray-600">
                Gérez votre compte et vos préférences
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`px-4 py-2 text-sm font-medium border ${getRoleColor(user?.role || "")}`}>
                {getRoleName(user?.role || "")}
              </Badge>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4 ring-4 ring-blue-100">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <Badge className={`mt-2 ${getRoleColor(user?.role || "")}`}>
                      {getRoleName(user?.role || "")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profil
                  </Button>
                  <Button
                    variant={activeTab === "security" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Sécurité
                  </Button>
                  {canManageAccount && (
                    <Button
                      variant={activeTab === "account" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("account")}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Compte
                    </Button>
                  )}
                  <Button
                    variant={activeTab === "support" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("support")}
                  >
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Support
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informations personnelles
                    </CardTitle>
                    <CardDescription>
                      Vos informations personnelles et professionnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Email</p>
                            <p className="text-sm font-medium">{user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Building className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Département</p>
                            <p className="text-sm font-medium">Informatique</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Localisation</p>
                            <p className="text-sm font-medium">Casablanca, Maroc</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Téléphone</p>
                            <p className="text-sm font-medium">+212 5XX-XXX-XXX</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Date d'embauche</p>
                            <p className="text-sm font-medium">15 Janvier 2023</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Award className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Statut</p>
                            <p className="text-sm font-medium text-green-600">Actif</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Permissions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Mes permissions
                    </CardTitle>
                    <CardDescription>
                      Les autorisations associées à votre rôle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getRolePermissions(user?.role || "").map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Changement de mot de passe
                    </CardTitle>
                    <CardDescription>
                      Sécurisez votre compte avec un mot de passe fort
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {message && (
                      <Alert variant={message.type === "success" ? "default" : "destructive"}>
                        {message.type === "success" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{message.text}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mot de passe actuel</label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Entrez votre mot de passe actuel"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nouveau mot de passe</label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Entrez le nouveau mot de passe"
                            value={formData.newPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Confirmer le mot de passe</label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmez le nouveau mot de passe"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {formData.confirmPassword && formData.newPassword && (
                          <div className="mt-2">
                            {formData.newPassword === formData.confirmPassword ? (
                              <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Les mots de passe correspondent</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs">Les mots de passe ne correspondent pas</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barre de sévérité du mot de passe */}
                    {formData.newPassword && (
                      <PasswordStrengthBar password={formData.newPassword} />
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={handlePasswordChange}
                        disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Mise à jour en cours...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Mettre à jour le mot de passe
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Logs - Only for IT */}
                {canAccessSecurityLogs && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <History className="w-5 h-5" />
                          Journal de sécurité
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadSecurityLogs}
                          disabled={isLoadingSecurity}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingSecurity ? 'animate-spin' : ''}`} />
                          Actualiser
                        </Button>
                      </div>
                      <CardDescription>
                        Historique des activités de sécurité de votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSecurity ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : securityLogs.length > 0 ? (
                        <div className="space-y-3">
                          {securityLogs.map((log, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  log.action === 'PASSWORD_CHANGE' ? 'bg-blue-100' :
                                  log.action === 'LOGIN' ? 'bg-green-100' :
                                  log.action === 'LOGIN_FAILED' ? 'bg-red-100' :
                                  'bg-gray-100'
                                }`}>
                                  {log.action === 'PASSWORD_CHANGE' ? <Lock className="w-4 h-4 text-blue-600" /> :
                                   log.action === 'LOGIN' ? <ShieldCheck className="w-4 h-4 text-green-600" /> :
                                   log.action === 'LOGIN_FAILED' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                                   <Info className="w-4 h-4 text-gray-600" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{getActionText(log.action)}</span>
                                    <Badge className={getActionBadgeColor(log.action)}>
                                      {log.action}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                                  </div>
                                  {log.details && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {log.details}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Aucune activité de sécurité récente</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Account Tab - Only for IT, RH, CEO */}
            {activeTab === "account" && canManageAccount && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Paramètres du compte
                    </CardTitle>
                    <CardDescription>
                      Gestion avancée de votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto p-4 flex items-start gap-3">
                        <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Réinitialiser mot de passe</div>
                          <div className="text-xs text-muted-foreground">Envoyer un email de réinitialisation</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="h-auto p-4 flex items-start gap-3">
                        <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Mettre à jour email</div>
                          <div className="text-xs text-muted-foreground">Changer votre adresse email</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="h-auto p-4 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Permissions</div>
                          <div className="text-xs text-muted-foreground">Gérer les accès et autorisations</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="h-auto p-4 flex items-start gap-3">
                        <Users className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Gestion d'équipe</div>
                          <div className="text-xs text-muted-foreground">Administrer les membres</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Support Tab */}
            {activeTab === "support" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Support Technique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-medium text-blue-900 mb-3">Support Technique Disponible</h4>
                      <p className="text-blue-700 text-sm mb-4">
                        Pour toute assistance technique, problème de connexion ou question sur le système RH, 
                        n'hésitez pas à contacter notre équipe IT.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">support@ytech-rh.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">+212 5XX-XXX-XXX</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Lun-Ven (9h-18h)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
