"use client"

import { useState, useEffect } from "react"
import { useEmployees } from "@/lib/employees-context"
import { useAuth } from "@/lib/auth-context"
import { rolePermissions, getPermissionsByRole, getRoleDescription } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { EnhancedEmployeeSelector } from "./enhanced-employee-selector"
import { AdvancedPagination } from "./advanced-pagination"
import { 
  Users, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Shield, 
  Key,
  RefreshCw, 
  MoreVertical,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Building2,
  Briefcase,
  Settings,
  Power,
  AlertTriangle,
  AlertCircle,
  Info,
  Lock,
  Unlock,
  Calendar,
  Check,
  PowerOff
} from "lucide-react"

interface UserAccount {
  id: string
  employeeId: string
  email: string
  role: string
  permissions: string[]
  canView: boolean
  canAdd: boolean
  canEdit: boolean
  canDelete: boolean
  isActive: boolean
  avatar?: string
  createdAt: string
  updatedAt: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    department: string
    position: string
    status: string
  }
}

export function EnhancedAccountManager() {
  const { employees } = useEmployees()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [resetPasswordInfo, setResetPasswordInfo] = useState<{ employeeName: string; emailSent: boolean } | null>(null)
  const [formData, setFormData] = useState({
    employeeId: "",
    role: "RH"  // Changed from "Employee" to "RH"
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Charger les comptes utilisateurs
  const fetchUserAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setUserAccounts(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserAccounts()
  }, [])

  // Filtrer les employés sans compte
  const availableEmployees = employees.filter(emp => 
    !userAccounts.some(account => account.employeeId === emp.id)
  )

  const handleCreateAccount = async () => {
    try {
      // Validation
      if (!formData.employeeId) {
        toast({
          title: "❌ Erreur de validation",
          description: "Veuillez sélectionner un employé",
          variant: "destructive"
        })
        return
      }
      
      if (!formData.role) {
        toast({
          title: "❌ Erreur de validation",
          description: "Veuillez sélectionner un rôle",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newAccount = await response.json()
        setUserAccounts(prev => [...prev, newAccount])
        setIsCreateDialogOpen(false)
        setFormData({ employeeId: "", role: "RH" })
        
        // Afficher un message de succès
        toast({
          title: "✅ Compte créé avec succès",
          description: `Le compte pour ${newAccount.employee?.firstName} ${newAccount.employee?.lastName} a été créé. ${newAccount.emailSent ? 'Un email a été envoyé avec les identifiants.' : ''}`,
          variant: "default"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Erreur de création",
          description: errorData.error || 'Erreur lors de la création du compte',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error)
      toast({
        title: "❌ Erreur système",
        description: "Une erreur est survenue lors de la création du compte",
        variant: "destructive"
      })
    }
  }

  const handleToggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: accountId,
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        await fetchUserAccounts()
        toast({
          title: "Statut mis à jour",
          description: `Le compte a été ${!currentStatus ? 'activé' : 'désactivé'} avec succès`,
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du compte",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling account status:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive"
      })
    }
  }

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return

    try {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedAccount.id,
          role: selectedAccount.role,
          isActive: selectedAccount.isActive
        }),
      })

      if (response.ok) {
        const updatedAccount = await response.json()
        setUserAccounts(prev =>
          prev.map(account => account.id === selectedAccount.id ? updatedAccount : account)
        )
        setIsEditDialogOpen(false)
        setSelectedAccount(null)
        
        toast({
          title: "✅ Compte mis à jour",
          description: "Les informations du compte ont été mises à jour avec succès",
          variant: "default"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Erreur de mise à jour",
          description: errorData.error || 'Erreur lors de la mise à jour du compte',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error)
      toast({
        title: "❌ Erreur système",
        description: "Une erreur est survenue lors de la mise à jour du compte",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return

    try {
      const response = await fetch(`/api/accounts?id=${selectedAccount.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUserAccounts(prev => prev.filter(account => account.id !== selectedAccount.id))
        setIsDeleteDialogOpen(false)
        setSelectedAccount(null)
        
        toast({
          title: "✅ Compte supprimé",
          description: "Le compte utilisateur a été supprimé avec succès",
          variant: "default"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Erreur de suppression",
          description: errorData.error || 'Erreur lors de la suppression du compte',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error)
      toast({
        title: "❌ Erreur système",
        description: "Une erreur est survenue lors de la suppression du compte",
        variant: "destructive"
      })
    }
  }

  const handleResetPassword = async (accountId: string) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: accountId })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Afficher un message de succès avec le toast
        const account = userAccounts.find(acc => acc.id === accountId)
        const employeeName = account?.employee 
          ? `${account.employee.firstName} ${account.employee.lastName}`
          : account?.email
        
        // Préparer les infos pour la popup
        setResetPasswordInfo({ employeeName, emailSent: result.emailSent })
        setIsSuccessDialogOpen(true)
        
        toast({
          title: "✅ Mot de passe réinitialisé avec succès",
          description: `Un nouveau mot de passe temporaire a été généré pour ${employeeName}.${result.emailSent ? ' Un email a été envoyé.' : ''}`,
          variant: "default"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Erreur de réinitialisation",
          description: errorData.error || 'Erreur lors de la réinitialisation du mot de passe',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
      toast({
        title: "❌ Erreur système",
        description: "Une erreur est survenue lors de la réinitialisation du mot de passe",
        variant: "destructive"
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "IT":
        return <Shield className="w-4 h-4 text-purple-600" />
      case "RH":
        return <Users className="w-4 h-4 text-blue-600" />
      case "CEO":
        return <Briefcase className="w-4 h-4 text-emerald-600" />
      default:
        return <UserCheck className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "IT":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "RH":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CEO":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  // Pagination logic
  const paginatedAccounts = userAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPages = Math.ceil(userAccounts.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des comptes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Comptes</h1>
          <p className="text-muted-foreground mt-1">
            {userAccounts.length} comptes utilisateurs • {availableEmployees.length} employés sans compte
          </p>
        </div>
        {currentUser?.role === "IT" && (
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={availableEmployees.length === 0}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Créer un compte
        </Button>
      )}
      </div>

      {/* Statistiques des comptes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Comptes</p>
                <p className="text-2xl font-bold text-blue-900">{userAccounts.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900">Comptes Actifs</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {userAccounts.filter(acc => acc.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Admin IT</p>
                <p className="text-2xl font-bold text-purple-900">
                  {userAccounts.filter(acc => acc.role === "IT").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900">CEO</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {userAccounts.filter(acc => acc.role === "CEO").length}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des comptes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Liste des Comptes Utilisateurs
          </CardTitle>
          <CardDescription>
            Gérez les comptes utilisateurs et leurs permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Utilisateur</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Rôle</TableHead>
                  <TableHead className="font-semibold text-center">Statut</TableHead>
                  <TableHead className="text-right font-semibold">Menu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Aucun compte utilisateur trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAccounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-sm font-medium">
                              {account.employee ? getInitials(account.employee.firstName, account.employee.lastName) : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {account.employee ? `${account.employee.firstName} ${account.employee.lastName}` : "Utilisateur inconnu"}
                            </p>
                            {account.employee && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="w-3 h-3" />
                                <span>{account.employee.department}</span>
                                <span>•</span>
                                <span>{account.employee.position}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{account.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(account.role)}
                          <Badge className={getRoleColor(account.role)}>
                            {account.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {currentUser?.role === "IT" ? (
                          <button
                            onClick={() => handleToggleAccountStatus(account.id, account.isActive)}
                            className={`relative h-6 w-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              account.isActive 
                                ? 'bg-emerald-500 focus:ring-emerald-500' 
                                : 'bg-gray-300 focus:ring-gray-400'
                            }`}
                            title={account.isActive ? "Désactiver le compte" : "Activer le compte"}
                          >
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                              account.isActive ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                            {account.isActive && (
                              <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-emerald-400 opacity-50 animate-pulse" />
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className={`relative h-6 w-12 rounded-full ${
                              account.isActive 
                                ? 'bg-emerald-500' 
                                : 'bg-gray-300'
                            }`}>
                              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white ${
                                account.isActive ? 'translate-x-6' : 'translate-x-0'
                              }`} />
                              {account.isActive && (
                                <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-emerald-400 opacity-50" />
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-muted">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAccount(account)
                                  setIsDetailsDialogOpen(true)
                                }}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                Détails du compte
                              </DropdownMenuItem>
                              {currentUser?.role === "IT" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAccount(account)
                                      setIsEditDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier le rôle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleResetPassword(account.id)}
                                    className="text-amber-600"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Réinitialiser le mot de passe
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAccount(account)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer le compte
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {userAccounts.length > 0 && (
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={userAccounts.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Dialogue de création de compte */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Créer un compte utilisateur
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Sélectionnez un employé et définissez son rôle pour créer un nouveau compte.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Section Sélection de l'employé */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold">1. Sélectionner un employé</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Rechercher et choisir un employé</label>
                <EnhancedEmployeeSelector
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
                  placeholder="Sélectionner un employé..."
                  showAccountStatus={true}
                />
              </div>
              
              {formData.employeeId && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary text-sm">Employé sélectionné</p>
                      <p className="text-xs text-muted-foreground">
                        {employees.find(emp => emp.id === formData.employeeId)?.firstName} {employees.find(emp => emp.id === formData.employeeId)?.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Sélection du rôle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold">2. Définir le rôle</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rôle de l'utilisateur</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="h-12 rounded-lg text-sm">
                    <SelectValue placeholder="Sélectionner un rôle..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {rolePermissions.map((role) => (
                      <SelectItem key={role.role} value={role.role} className="p-2">
                        <div className="flex items-center gap-2 p-1">
                          {getRoleIcon(role.role)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{role.role}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.role && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-primary" />
                      <h4 className="font-medium text-sm">Autorisations pour {formData.role}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getPermissionsByRole(formData.role).map((permission) => (
                        <div key={permission} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-xs font-medium">
                            {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                setFormData({ employeeId: "", role: "RH" })
              }} 
              className="flex-1 h-10 rounded-lg text-sm"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateAccount} 
              disabled={!formData.employeeId || !formData.role}
              className="flex-1 h-10 rounded-lg text-sm font-medium"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Créer le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de modification de compte */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <Settings className="w-8 h-8 text-amber-600" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              Modifier le compte utilisateur
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Modifiez le rôle, les permissions et le statut du compte.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="space-y-6 py-4">
              {/* Section Informations de l'employé */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Users className="w-4 h-4 text-amber-600" />
                  <h3 className="text-base font-semibold">1. Informations de l'employé</h3>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-700 text-lg font-bold">
                        {selectedAccount.employee ? getInitials(selectedAccount.employee.firstName, selectedAccount.employee.lastName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-amber-900">
                        {selectedAccount.employee ? `${selectedAccount.employee.firstName} ${selectedAccount.employee.lastName}` : "Utilisateur inconnu"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-amber-600" />
                        <p className="text-amber-700 text-sm">{selectedAccount.email}</p>
                      </div>
                      {selectedAccount.employee && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-amber-600">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{selectedAccount.employee.department}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{selectedAccount.employee.position}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Rôle et permissions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <h3 className="text-base font-semibold">2. Rôle et permissions</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rôle de l'utilisateur</label>
                  <Select
                    value={selectedAccount.role}
                    onValueChange={(value) => setSelectedAccount(prev => prev ? { ...prev, role: value } : null)}
                  >
                    <SelectTrigger className="h-12 rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {rolePermissions.map((role) => (
                        <SelectItem key={role.role} value={role.role} className="p-2">
                          <div className="flex items-center gap-2 p-1">
                            {getRoleIcon(role.role)}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{role.role}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-amber-600" />
                      <h4 className="font-medium text-sm">Autorisations pour {selectedAccount.role}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getPermissionsByRole(selectedAccount.role).map((permission) => (
                        <div key={permission} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          <span className="text-xs font-medium">
                            {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Statut du compte */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Power className="w-4 h-4 text-amber-600" />
                  <h3 className="text-base font-semibold">3. Statut du compte</h3>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">Compte actif</label>
                      <p className="text-xs text-muted-foreground">
                        {selectedAccount.isActive 
                          ? "✅ L'utilisateur peut se connecter" 
                          : "❌ L'utilisateur ne peut pas se connecter"}
                      </p>
                    </div>
                    <Switch
                      checked={selectedAccount.isActive}
                      onCheckedChange={(checked) => setSelectedAccount(prev => prev ? { ...prev, isActive: checked } : null)}
                      className="scale-110"
                    />
                  </div>
                  
                  {!selectedAccount.isActive && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 text-sm">Compte désactivé</p>
                          <p className="text-xs text-amber-700 mt-1">
                            L'utilisateur ne pourra plus se connecter. Les données sont conservées.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Réinitialisation du mot de passe */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Key className="w-4 h-4 text-amber-600" />
                  <h3 className="text-base font-semibold">4. Réinitialisation du mot de passe</h3>
                </div>
                
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-amber-800 text-sm">Réinitialisation du mot de passe</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Générer un nouveau mot de passe temporaire et l'envoyer par email à l'employé.
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleResetPassword(selectedAccount.id)}
                      className="w-full h-10 rounded-lg text-sm font-medium border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Réinitialiser le mot de passe
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section Actions dangereuses */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <h3 className="text-base font-semibold text-destructive">5. Suppression</h3>
                </div>
                
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-destructive text-sm">Suppression définitive</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cette action est irréversible et supprimera toutes les données.
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsDeleteDialogOpen(true)
                        setIsEditDialogOpen(false)
                      }}
                      className="w-full h-10 rounded-lg text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer ce compte
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)} 
              className="flex-1 h-10 rounded-lg text-sm"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateAccount}
              className="flex-1 h-10 rounded-lg text-sm font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Supprimer le compte</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le compte de{" "}
              <strong>
                {selectedAccount?.employee ? `${selectedAccount.employee.firstName} ${selectedAccount.employee.lastName}` : selectedAccount?.email}
              </strong>
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue de détails du compte */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <Info className="w-10 h-10 text-blue-600" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Détails du compte utilisateur
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Informations complètes et autorisations du compte utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="space-y-8 py-6">
              {/* Section Informations de l'employé */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Informations de l'employé</h3>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 text-blue-700 text-xl font-bold">
                        {selectedAccount.employee ? getInitials(selectedAccount.employee.firstName, selectedAccount.employee.lastName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-xl font-bold text-blue-900">
                        {selectedAccount.employee ? `${selectedAccount.employee.firstName} ${selectedAccount.employee.lastName}` : "Utilisateur inconnu"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <p className="text-blue-700">{selectedAccount.email}</p>
                      </div>
                      {selectedAccount.employee && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{selectedAccount.employee.department}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{selectedAccount.employee.position}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Rôle et permissions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Rôle et autorisations</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(selectedAccount.role)}
                      <div>
                        <p className="font-semibold text-lg">Rôle : {selectedAccount.role}</p>
                        <p className="text-sm text-muted-foreground mt-1">{getRoleDescription(selectedAccount.role)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold">Autorisations détaillées</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getPermissionsByRole(selectedAccount.role).map((permission) => (
                          <div key={permission} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border/50">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getPermissionDescription(permission)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Statut et sécurité */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Statut et sécurité</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      {selectedAccount.isActive ? (
                        <Unlock className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold">Statut du compte</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAccount.isActive ? "Actif - Accès autorisé" : "Inactif - Accès bloqué"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">Date de création</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedAccount.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-4 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)} 
              className="flex-1 h-12 rounded-xl text-base"
            >
              Fermer
            </Button>
            <Button 
              onClick={() => {
                setIsDetailsDialogOpen(false)
                setIsEditDialogOpen(true)
              }}
              className="flex-1 h-12 rounded-xl text-base font-semibold"
            >
              <Edit className="w-5 h-5 mr-2" />
              Modifier le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup de succès pour la réinitialisation du mot de passe */}
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <AlertDialogTitle className="text-xl text-emerald-800">
              Mot de passe réinitialisé avec succès !
            </AlertDialogTitle>
            <AlertDialogDescription className="text-emerald-700">
              Un nouveau mot de passe temporaire a été généré pour 
              <strong className="text-emerald-800"> {resetPasswordInfo?.employeeName} </strong>
              {resetPasswordInfo?.emailSent && (
                <>
                  <br />
                  <span className="text-emerald-600 font-medium">
                    ✅ Un email a été envoyé avec les nouvelles identifiants
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogAction 
              onClick={() => {
                setIsSuccessDialogOpen(false)
                setResetPasswordInfo(null)
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Fonction utilitaire pour décrire les permissions
function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    "view_dashboard": "Accès au tableau de bord",
    "view_employees": "Voir la liste des employés",
    "add_employee": "Ajouter de nouveaux employés",
    "edit_employee": "Modifier les informations des employés",
    "delete_employee": "Supprimer des employés",
    "view_details": "Voir les détails des employés",
    "manage_accounts": "Voir et gérer les comptes utilisateurs",
    "manage_settings": "Accéder aux paramètres système",
    "change_password": "Changer son mot de passe"
  }
  return descriptions[permission] || "Permission non définie"
}
