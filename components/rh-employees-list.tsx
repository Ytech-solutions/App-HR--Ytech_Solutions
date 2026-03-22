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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedEmployeeForm } from "./enhanced-employee-form"
import { EmployeeDetailModal } from "./employee-detail-modal"
import { AdvancedPagination } from "./advanced-pagination"
import { 
  Search, 
  UserPlus, 
  Eye, 
  Edit, 
  Users, 
  Filter,
  Download,
  Activity,
  Building2,
  DollarSign,
  Mail,
  Phone,
  Trash2
} from "lucide-react"

export function RHEmployeesList() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useEmployees()
  const { user, hasPermission } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter((emp) => {
      const matchesSearch =
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment =
        departmentFilter === "all" || emp.department === departmentFilter
      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter
      return matchesSearch && matchesDepartment && matchesStatus
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.lastName.localeCompare(b.lastName)
        case "department":
          return a.department.localeCompare(b.department)
        case "position":
          return a.position.localeCompare(b.position)
        case "salary":
          return b.salary - a.salary
        case "hireDate":
          return new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [employees, searchQuery, departmentFilter, statusFilter, sortBy])

  // Pagination logic
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedEmployees.slice(startIndex, endIndex)
  }, [filteredAndSortedEmployees, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedEmployees.length / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

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

  const handleSubmit = (data: Omit<Employee, "id" | "createdAt" | "updatedAt"> | Partial<Employee>) => {
    if (formMode === "add") {
      addEmployee(data as Omit<Employee, "id" | "createdAt" | "updatedAt">)
    } else if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, data)
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

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <Activity className="w-4 h-4 text-emerald-500" />
    ) : (
      <Activity className="w-4 h-4 text-gray-400" />
    )
  }

  const exportToCSV = () => {
    const headers = ["Nom", "Prénom", "Email", "Téléphone", "Département", "Poste", "Date d'embauche", "Salaire", "Statut"]
    const csvData = filteredAndSortedEmployees.map(emp => [
      emp.lastName,
      emp.firstName,
      emp.email,
      emp.phone,
      emp.department,
      emp.position,
      emp.hireDate,
      emp.salary.toString(),
      emp.status === "active" ? "Actif" : "Inactif"
    ])
    
    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employees.csv"
    a.click()
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          {hasPermission("add_employee") && (
            <Button onClick={handleAddClick} size="lg" className="w-full sm:w-auto">
              <UserPlus className="w-5 h-5 mr-2" />
              Ajouter un employé
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques des employés - Style Boards comme la gestion des comptes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl">
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

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900">Employés Actifs</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {employees.filter(emp => emp.status === "active").length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Nouveaux Employés</p>
                <p className="text-2xl font-bold text-purple-900">
                  {employees.filter(emp => {
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return new Date(emp.hireDate) >= thirtyDaysAgo
                  }).length}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900">Salaire Moyen</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {employees.length > 0 ? Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length).toLocaleString('fr-MA') : 0} MAD
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des employés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Liste des Employés
          </CardTitle>
          <CardDescription>
            Gérez les employés et leurs informations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Enhanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="department">Département</SelectItem>
                <SelectItem value="position">Poste</SelectItem>
                <SelectItem value="salary">Salaire</SelectItem>
                <SelectItem value="hireDate">Date d'embauche</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Département</TableHead>
                  <TableHead className="font-semibold">Poste</TableHead>
                  <TableHead className="font-semibold text-center">Statut</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Aucun employé trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-sm font-medium">
                              {getInitials(employee.firstName, employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{employee.phone}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{employee.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{employee.position}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(employee.status)}
                          <Badge
                            className={
                              employee.status === "active"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {employee.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewClick(employee)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission("edit_employee") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(employee)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission("delete_employee") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(employee)}
                              className="text-destructive hover:text-destructive"
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredAndSortedEmployees.length > 0 && (
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedEmployees.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedEmployee(null)
        }}
        onEdit={() => selectedEmployee && hasPermission("edit_employee") && handleEditClick(selectedEmployee)}
        onDelete={() => selectedEmployee && hasPermission("delete_employee") && handleDeleteClick(selectedEmployee)}
        canEdit={hasPermission("edit_employee")}
        canDelete={hasPermission("delete_employee")}
      />

      {/* Employee Form Modal */}
      <EnhancedEmployeeForm
        employee={selectedEmployee || undefined}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedEmployee(null)
        }}
        onSubmit={handleSubmit}
        mode={formMode}
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
            <AlertDialogCancel className="flex-1">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
