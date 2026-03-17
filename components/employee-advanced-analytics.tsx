"use client"

import { useState, useMemo } from "react"
import { useEmployees } from "@/lib/employees-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  Building,
  TrendingUp,
  Award,
  Star,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Shield,
  Heart,
  ThumbsUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

interface EmployeeAdvancedAnalyticsProps {
  className?: string
}

export function EmployeeAdvancedAnalytics({ className }: EmployeeAdvancedAnalyticsProps) {
  const { employees, departments } = useEmployees()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Advanced filtering and sorting
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(emp => emp.department === selectedDepartment)
    }

    // Sort employees
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case "salary":
          return b.salary - a.salary
        case "department":
          return a.department.localeCompare(b.department)
        case "hireDate":
          return new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [employees, searchTerm, selectedDepartment, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredAndSortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Department statistics
  const departmentStats = useMemo(() => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept)
      const avgSalary = deptEmployees.length > 0 
        ? Math.round(deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length)
        : 0
      const activeCount = deptEmployees.filter(emp => emp.status === "active").length
      
      return {
        name: dept,
        total: deptEmployees.length,
        active: activeCount,
        avgSalary,
        percentage: employees.length > 0 ? Math.round((deptEmployees.length / employees.length) * 100) : 0
      }
    })
  }, [employees, departments])

  // Performance metrics simulation
  const performanceData = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      performance: Math.floor(Math.random() * 30) + 70, // 70-100
      productivity: Math.floor(Math.random() * 25) + 75, // 75-100
      satisfaction: Math.floor(Math.random() * 20) + 80, // 80-100
      projects: Math.floor(Math.random() * 10) + 1, // 1-10 projects
      rating: (Math.random() * 2 + 3).toFixed(1) // 3.0-5.0
    }))
  }, [employees])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-100"
    if (score >= 80) return "text-blue-600 bg-blue-100"
    if (score >= 70) return "text-amber-600 bg-amber-100"
    return "text-red-600 bg-red-100"
  }

  const getRatingStars = (rating: string) => {
    const stars = []
    const fullStars = Math.floor(parseFloat(rating))
    const hasHalfStar = parseFloat(rating) % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)
    }
    
    if (hasHalfStar && fullStars < 5) {
      stars.push(<Star key="half" className="w-4 h-4 fill-amber-200 text-amber-400" />)
    }
    
    const emptyStars = 5 - Math.ceil(parseFloat(rating))
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }
    
    return stars
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Advanced Search and Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b">
          <CardTitle className="flex items-center gap-3">
            <Search className="w-5 h-5" />
            Recherche et Filtres Avancés
          </CardTitle>
          <CardDescription>Recherchez et filtrez les employés avec des critères multiples</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, poste, département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="all">Tous les départements</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="name">Nom</option>
                <option value="salary">Salaire</option>
                <option value="department">Département</option>
                <option value="hireDate">Date d'embauche</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600/80">Total Recherché</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{filteredAndSortedEmployees.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600/80">Salaire Moyen</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">
                  {formatCurrency(Math.round(filteredAndSortedEmployees.reduce((sum, emp) => sum + emp.salary, 0) / filteredAndSortedEmployees.length) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600/80">Performance Moyenne</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {Math.round(performanceData.reduce((sum, emp) => sum + emp.performance, 0) / performanceData.length) || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600/80">Total Projets</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {performanceData.reduce((sum, emp) => sum + emp.projects, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Liste des Employés
              </CardTitle>
              <CardDescription>
                {filteredAndSortedEmployees.length} employé(s) trouvé(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="font-semibold">Département</TableHead>
                  <TableHead className="font-semibold">Poste</TableHead>
                  <TableHead className="font-semibold">Salaire</TableHead>
                  <TableHead className="font-semibold">Performance</TableHead>
                  <TableHead className="font-semibold">Note</TableHead>
                  <TableHead className="font-semibold">Projets</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => {
                  const perfData = performanceData.find(p => p.id === employee.id)
                  return (
                    <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(employee.firstName, employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {employee.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{employee.position}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(employee.salary)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(perfData?.performance || 0)}`}>
                            {perfData?.performance || 0}%
                          </div>
                          <Progress value={perfData?.performance || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getRatingStars(perfData?.rating || "3.0")}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({perfData?.rating || "3.0"})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{perfData?.projects || 0}</span>
                          <Badge variant="outline" className="text-xs">
                            projets
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Envoyer email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedEmployees.length)} sur {filteredAndSortedEmployees.length} employés
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
