"use client"

import { useState, useEffect } from "react"
import type { Employee } from "@/lib/types"
import { useEmployees } from "@/lib/employees-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  UserPlus, 
  Edit, 
  Plus, 
  Check, 
  X, 
  Search,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  User,
  Sparkles
} from "lucide-react"

interface EmployeeFormProps {
  employee?: Employee
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Employee, "id" | "createdAt" | "updatedAt"> | Partial<Employee>) => void
  mode: "add" | "edit"
}

export function EnhancedEmployeeForm({ employee, open, onClose, onSubmit, mode }: EmployeeFormProps) {
  const { departments, addDepartment, refreshDepartments, employees } = useEmployees()
  
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    department: employee?.department || "",
    position: employee?.position || "",
    hireDate: employee?.hireDate || new Date().toISOString().split("T")[0],
    salary: employee?.salary || 0,
    address: employee?.address || "",
    status: employee?.status || "active",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newDepartment, setNewDepartment] = useState("")
  const [showNewDeptInput, setShowNewDeptInput] = useState(false)
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([])

  // Filtrer les départements selon la recherche
  useEffect(() => {
    const filtered = departments.filter(dept => 
      dept.toLowerCase().includes(departmentSearch.toLowerCase())
    )
    setFilteredDepartments(filtered)
  }, [departmentSearch, departments])

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis"
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide"
    } else {
      // Vérifier l'unicité de l'email (seulement en mode ajout)
      if (mode === "add") {
        const emailExists = employees.some(emp => 
          emp.email.toLowerCase() === formData.email.toLowerCase()
        )
        if (emailExists) {
          newErrors.email = "Cet email est déjà utilisé par un autre employé"
        }
      } else {
        // En mode édition, vérifier que l'email n'est pas utilisé par un autre employé
        const otherEmployeeWithEmail = employees.find(emp => 
          emp.id !== employee?.id && 
          emp.email.toLowerCase() === formData.email.toLowerCase()
        )
        if (otherEmployeeWithEmail) {
          newErrors.email = "Cet email est déjà utilisé par un autre employé"
        }
      }
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis"
    } else if (!/^\+?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Le numéro de téléphone n'est pas valide"
    }
    if (!formData.department) {
      newErrors.department = "Le département est requis"
    }
    if (!formData.position.trim()) {
      newErrors.position = "Le poste est requis"
    }
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary = "Le salaire doit être supérieur à 0"
    }
    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation de chargement
      onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        hireDate: new Date().toISOString().split("T")[0],
        salary: 0,
        address: "",
        status: "active",
      })
      setErrors({})
    } catch (error) {
      // Erreur lors de la soumission
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddDepartment = async () => {
    if (newDepartment.trim()) {
      const success = await addDepartment(newDepartment.trim())
      if (success === true) {
        // Refresh departments list to get the updated list from database
        await refreshDepartments()
        setFormData(prev => ({ ...prev, department: newDepartment.trim() }))
        setNewDepartment("")
        setShowNewDeptInput(false)
      }
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-4">
            {mode === "add" ? (
              <UserPlus className="w-8 h-8 text-primary" />
            ) : (
              <Edit className="w-8 h-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-xl font-semibold">
            {mode === "add" ? "Ajouter un employé" : "Modifier un employé"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Remplissez les informations pour créer un nouvel employé" 
              : "Modifiez les informations de l'employé"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations Personnelles */}
          <Card className="border-2 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Informations Personnelles</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Prénom *</FieldLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Jean"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Nom *</FieldLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Dupont"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Email *</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="employe@ytech-rh.ma"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Téléphone *</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+212 6XX-XXX-XXX"
                      className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Informations Professionnelles */}
          <Card className="border-2 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Informations Professionnelles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Département *</FieldLabel>
                  <Popover open={showNewDeptInput} onOpenChange={setShowNewDeptInput}>
                    <PopoverTrigger asChild>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <div className="p-2 sticky top-0 bg-white z-10">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="Rechercher un département..."
                                value={departmentSearch}
                                onChange={(e) => setDepartmentSearch(e.target.value)}
                                className="pl-8 h-8 text-sm border border-border"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {filteredDepartments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {dept}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                          <div className="border-t p-2 sticky bottom-0 bg-white">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowNewDeptInput(true)
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Nouveau département
                            </Button>
                          </div>
                        </SelectContent>
                      </Select>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-3">
                        <h4 className="font-medium">Ajouter un département</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nom du département"
                            value={newDepartment}
                            onChange={(e) => setNewDepartment(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddDepartment}
                            disabled={!newDepartment.trim()}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.department && (
                    <p className="text-sm text-red-500 mt-1">{errors.department}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Poste *</FieldLabel>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Développeur Full Stack"
                      className={`pl-10 ${errors.position ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.position && (
                    <p className="text-sm text-red-500 mt-1">{errors.position}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Date d'embauche *</FieldLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                      className={`pl-10 ${errors.hireDate ? "border-red-500" : ""}`}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Salaire annuel (MAD) *</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">MAD</span>
                    <Input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                      placeholder="480000"
                      className={`pl-16 ${errors.salary ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.salary && (
                    <p className="text-sm text-red-500 mt-1">{errors.salary}</p>
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Informations Additionnelles */}
          <Card className="border-2 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Informations Additionnelles</h3>
              </div>

              <div className="space-y-4">
                <Field>
                  <FieldLabel>Adresse *</FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Rue Mohammed V, Casablanca 20000"
                      className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Statut</FieldLabel>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "active" | "inactive" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          Actif
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          Inactif
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {mode === "add" ? "Création..." : "Mise à jour..."}
                </>
              ) : (
                <>
                  {mode === "add" ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Créer l'employé
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mettre à jour
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
