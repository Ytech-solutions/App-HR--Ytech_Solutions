"use client"

import { useState, useMemo } from "react"
import { useEmployees } from "@/lib/employees-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Search, 
  Users, 
  Building2, 
  Briefcase, 
  MapPin,
  Check,
  X,
  Filter
} from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  position: string
  address: string
  status: string
  hasAccount?: boolean
}

interface EnhancedEmployeeSelectorProps {
  value?: string
  onValueChange: (employeeId: string) => void
  placeholder?: string
  disabled?: boolean
  showAccountStatus?: boolean
  filterByDepartment?: string
}

export function EnhancedEmployeeSelector({
  value,
  onValueChange,
  placeholder = "Sélectionner un employé",
  disabled = false,
  showAccountStatus = true,
  filterByDepartment
}: EnhancedEmployeeSelectorProps) {
  const { employees } = useEmployees()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>(filterByDepartment || "all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Obtenir la liste des départements uniques
  const departments = useMemo(() => {
    const depts = [...new Set(employees.map(emp => emp.department))]
    return depts.sort()
  }, [employees])

  // Filtrer les employés selon les critères
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
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
  }, [employees, searchQuery, departmentFilter, statusFilter])

  // Obtenir l'employé sélectionné
  const selectedEmployee = useMemo(() => {
    return employees.find(emp => emp.id === value)
  }, [employees, value])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getDepartmentColor = (department: string) => {
    const colors = {
      "IT": "bg-purple-100 text-purple-800 border-purple-200",
      "RH": "bg-blue-100 text-blue-800 border-blue-200",
      "Finance": "bg-green-100 text-green-800 border-green-200",
      "Marketing": "bg-orange-100 text-orange-800 border-orange-200",
      "Operations": "bg-red-100 text-red-800 border-red-200",
      "Commercial": "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    return colors[department as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start h-auto p-3"
          disabled={disabled}
        >
          {selectedEmployee ? (
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-xs font-medium">
                  {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </span>
                  {showAccountStatus && selectedEmployee.hasAccount && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedEmployee.position}</span>
                  <span>•</span>
                  <span>{selectedEmployee.department}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{placeholder}</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="start">
        <div className="space-y-3 p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-none bg-muted/50"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="h-8 flex-1">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      {dept}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 flex-1">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    Actifs
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    Inactifs
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || departmentFilter !== "all" || statusFilter !== "all"
                  ? "Aucun employé trouvé pour ces critères"
                  : "Aucun employé disponible"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    onValueChange(employee.id)
                    setOpen(false)
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-xs font-medium">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {employee.firstName} {employee.lastName}
                      </span>
                      {showAccountStatus && employee.hasAccount && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      <span className="truncate">{employee.position}</span>
                      <span>•</span>
                      <Building2 className="w-3 h-3" />
                      <span>{employee.department}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 items-end">
                    <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                      {employee.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                    <Badge className={`text-xs ${getDepartmentColor(employee.department)}`}>
                      {employee.department}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(searchQuery || departmentFilter !== "all" || statusFilter !== "all") && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setSearchQuery("")
                setDepartmentFilter("all")
                setStatusFilter("all")
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
