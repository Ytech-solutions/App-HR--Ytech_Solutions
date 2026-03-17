"use client"

import { useState, useEffect } from "react"
import type { Employee } from "@/lib/types"
import { useEmployees } from "@/lib/employees-context"
import { formatEUR, convertEURtoMADFormatted } from "@/lib/currency-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { UserPlus, Edit, Plus, Check, X, TrendingUp } from "lucide-react"

interface EmployeeFormProps {
  employee?: Employee
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Employee, "id" | "createdAt" | "updatedAt"> | Partial<Employee>) => Promise<void>
  mode: "add" | "edit"
}

export function EmployeeForm({ employee, open, onClose, onSubmit, mode }: EmployeeFormProps) {
  const { departments, addDepartment, refreshDepartments, employees } = useEmployees()
  
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    department: employee?.department || (departments[0] || ""),
    position: employee?.position || "",
    hireDate: employee?.hireDate || new Date().toISOString().split("T")[0],
    salary: employee?.salary || 0,
    address: employee?.address || "",
    status: employee?.status || ("active" as const),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newDepartment, setNewDepartment] = useState("")
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)
  const [departmentError, setDepartmentError] = useState("")

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        hireDate: employee.hireDate,
        salary: employee.salary,
        address: employee.address,
        status: employee.status,
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: departments[0] || "",
        position: "",
        hireDate: new Date().toISOString().split("T")[0],
        salary: 0,
        address: "",
        status: "active",
      })
    }
    setNewDepartment("")
    setIsAddingDepartment(false)
    setDepartmentError("")
    setErrors({})
  }, [employee, open, departments])

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
      // Vérifier l'unicité de l'email
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
    
    await onSubmit(formData)
    onClose()
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      setDepartmentError("Le nom est requis")
      return
    }
    
    const success = await addDepartment(newDepartment.trim())
    if (success) {
      // Refresh departments list to get the updated list from database
      await refreshDepartments()
      setFormData((prev) => ({ ...prev, department: newDepartment.trim() }))
      setNewDepartment("")
      setIsAddingDepartment(false)
      setDepartmentError("")
    } else {
      setDepartmentError("Ce departement existe deja")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            {mode === "add" ? (
              <UserPlus className="w-8 h-8 text-primary" />
            ) : (
              <Edit className="w-8 h-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold">
            {mode === "add" ? "Nouvel employe" : "Modifier l'employe"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "add"
              ? "Remplissez les informations du nouvel employe"
              : "Modifiez les informations de l'employe"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="firstName" className="text-sm font-medium">Nom</FieldLabel>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Mohammed"
                  className={`h-11 rounded-xl border-border/50 focus:border-primary ${errors.firstName ? "border-red-500" : ""}`}
                  required
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName" className="text-sm font-medium">Prénom</FieldLabel>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Ali"
                  className={`h-11 rounded-xl border-border/50 focus:border-primary ${errors.lastName ? "border-red-500" : ""}`}
                  required
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="mohammed.ali@ytech.ma"
                  className={`h-11 rounded-xl border-border/50 focus:border-primary ${errors.email ? "border-red-500" : ""}`}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone" className="text-sm font-medium">Téléphone</FieldLabel>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+212 6 12 34 56 78"
                  className={`h-11 rounded-xl border-border/50 focus:border-primary ${errors.phone ? "border-red-500" : ""}`}
                  required
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-sm font-medium">Departement</FieldLabel>
                <div className="flex gap-2">
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-border/50 focus:border-primary flex-1">
                      <SelectValue placeholder="Selectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Popover open={isAddingDepartment} onOpenChange={setIsAddingDepartment}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4" align="end">
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Ajouter un departement</p>
                        <Input
                          value={newDepartment}
                          onChange={(e) => {
                            setNewDepartment(e.target.value)
                            setDepartmentError("")
                          }}
                          placeholder="Nom du departement"
                          className="h-10 rounded-lg"
                        />
                        {departmentError && (
                          <p className="text-xs text-destructive">{departmentError}</p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setIsAddingDepartment(false)
                              setNewDepartment("")
                              setDepartmentError("")
                            }}
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Annuler
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1"
                            onClick={handleAddDepartment}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="position" className="text-sm font-medium">Poste</FieldLabel>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="Développeur Senior"
                  className={`h-11 rounded-xl border-border/50 focus:border-primary ${errors.position ? "border-red-500" : ""}`}
                  required
                />
                {errors.position && (
                  <p className="text-sm text-red-500 mt-1">{errors.position}</p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="hireDate" className="text-sm font-medium">Date d'embauche</FieldLabel>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange("hireDate", e.target.value)}
                  className="h-11 rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="salary" className="text-sm font-medium">Salaire annuel</FieldLabel>
                <div className="space-y-2">
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleChange("salary", parseInt(e.target.value) || 0)}
                    placeholder="45000"
                    className={`h-11 rounded-xl border-border/50 focus:border-primary ${errors.salary ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.salary && (
                    <p className="text-sm text-red-500 mt-1">{errors.salary}</p>
                  )}
                  {formData.salary > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-amber-700 font-medium">Conversion:</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-800">{formatEUR(formData.salary)}</p>
                        <p className="text-xs text-amber-600">≈ {convertEURtoMADFormatted(formData.salary)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address" className="text-sm font-medium">Adresse</FieldLabel>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Avenue Mohammed V, Casablanca"
                className={`h-11 rounded-xl border-border/50 focus:border-primary ${errors.address ? "border-red-500" : ""}`}
                required
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className="text-sm font-medium">Statut</FieldLabel>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger className="h-11 rounded-xl border-border/50 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-8 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl"
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1 h-11 rounded-xl">
              {mode === "add" ? "Ajouter" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
