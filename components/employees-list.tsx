"use client"

import { useState, useMemo } from "react"
import { useEmployees } from "@/lib/employees-context"
import { useAuth } from "@/lib/auth-context"
import type { Employee } from "@/lib/types"
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
import { EmployeeForm } from "./employee-form"
import { EmployeeDetailModal } from "./employee-detail-modal"
import { Search, UserPlus, Eye, Edit, Trash2, Users, User, TrendingUp, DollarSign, UserCheck } from "lucide-react"

export function EmployeesList() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useEmployees()
  const { hasPermission, user } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")

  const isReadOnly = user?.role === "CEO"

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment =
        departmentFilter === "all" || emp.department === departmentFilter
      return matchesSearch && matchesDepartment
    })
  }, [employees, searchQuery, departmentFilter])

  const handleAddClick = () => {
    setSelectedEmployee(null)
    setFormMode("add")
    setIsFormOpen(true)
  }

  const handleViewClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDetailOpen(true)
  }

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormMode("edit")
    setIsFormOpen(true)
    setIsDetailOpen(false)
  }

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
    setIsDetailOpen(false)
  }

  const handleFormSubmit = async (data: Omit<Employee, "id" | "createdAt" | "updatedAt"> | Partial<Employee>) => {
    if (formMode === "add") {
      await addEmployee(data as Omit<Employee, "id" | "createdAt" | "updatedAt">)
    } else if (selectedEmployee) {
      await updateEmployee(selectedEmployee.id, data)
    }
    setIsFormOpen(false)
    setSelectedEmployee(null)
  }

  const handleDeleteConfirm = async () => {
    if (selectedEmployee) {
      await deleteEmployee(selectedEmployee.id)
    }
    setIsDeleteDialogOpen(false)
    setSelectedEmployee(null)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestion des Employés</h1>
          <p className="text-muted-foreground mt-1">
            {employees.length} employés au total
          </p>
        </div>
        {hasPermission("add_employee") && !isReadOnly && (
          <Button onClick={handleAddClick} size="lg" className="w-full sm:w-auto">
            <UserPlus className="w-5 h-5 mr-2" />
            Ajouter un employé
          </Button>
        )}
      </div>

      {/* Cartes d'analytics pour le rôle admin */}
      {user?.role === "IT" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Employés</p>
                  <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-900">Employés Actifs</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {employees.filter(emp => emp.status === "active").length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Nouveaux Employés</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {employees.filter(emp => {
                      const hireDate = new Date(emp.hireDate)
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      return hireDate >= thirtyDaysAgo
                    }).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-900">Salaire Moyen</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {employees.length > 0 
                      ? new Intl.NumberFormat('fr-MA', { 
                          style: 'currency', 
                          currency: 'MAD',
                          maximumFractionDigits: 0 
                        }).format(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length)
                      : "0 MAD"
                    }
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Liste des employés
          </CardTitle>
          <CardDescription>
            Recherchez et filtrez les employés par nom ou département
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-52 h-11">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table for desktop, Cards for mobile */}
          <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="font-semibold">Département</TableHead>
                  <TableHead className="font-semibold">Poste</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Aucun employé trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {getInitials(employee.firstName, employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </p>
                              {employee.hasAccount && (
                                <User className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">{employee.department}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{employee.position}</TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.status === "active" ? "default" : "secondary"}
                          className={
                            employee.status === "active"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : ""
                          }
                        >
                          {employee.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewClick(employee)}
                            className="hover:bg-muted"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission("edit_employee") && !isReadOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(employee)}
                              className="hover:bg-muted"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission("delete_employee") && !isReadOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(employee)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Aucun employé trouvé</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(employee.firstName, employee.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </p>
                            {employee.hasAccount && (
                              <User className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={employee.status === "active" ? "default" : "secondary"}
                        className={
                          employee.status === "active"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : ""
                        }
                      >
                        {employee.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Département:</span>
                        <Badge variant="outline" className="font-normal text-xs">{employee.department}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Poste:</span>
                        <span className="text-sm font-medium">{employee.position}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(employee)}
                        className="hover:bg-muted"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {hasPermission("edit_employee") && !isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(employee)}
                          className="hover:bg-muted"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {hasPermission("delete_employee") && !isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(employee)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee Form Modal */}
      <EmployeeForm
        employee={selectedEmployee || undefined}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedEmployee(null)
        }}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedEmployee(null)
        }}
        onEdit={() => selectedEmployee && handleEditClick(selectedEmployee)}
        onDelete={() => selectedEmployee && handleDeleteClick(selectedEmployee)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'employé{" "}
              <strong>
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </strong>
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
