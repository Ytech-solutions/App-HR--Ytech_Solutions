"use client"

import { useState } from "react"
import { useEmployees } from "@/lib/employees-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  UserPlus,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Target,
  Award,
} from "lucide-react"

export function DepartmentsManagement() {
  const { employees, departments } = useEmployees()
  const { user } = useAuth()
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  // Calculate department statistics
  const departmentStats = departments.map((dept) => {
    const deptEmployees = employees.filter((e) => e.department === dept)
    const activeDeptEmployees = deptEmployees.filter((e) => e.status === "active")
    const deptTotalSalary = deptEmployees.reduce((acc, e) => acc + e.salary, 0)
    const avgSalary = deptEmployees.length > 0 ? deptTotalSalary / deptEmployees.length : 0
    
    // Calculate performance metrics
    const performanceScore = Math.random() * 40 + 60 // Simulated score between 60-100
    const satisfactionRate = Math.random() * 30 + 70 // Simulated satisfaction between 70-100
    
    return {
      name: dept,
      totalEmployees: deptEmployees.length,
      activeEmployees: activeDeptEmployees.length,
      totalSalary: deptTotalSalary,
      avgSalary: avgSalary,
      performanceScore: performanceScore,
      satisfactionRate: satisfactionRate,
      recentHires: deptEmployees.filter((e) => {
        const hireDate = new Date(e.hireDate)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        return hireDate > threeMonthsAgo
      }).length,
      manager: deptEmployees.find((e) => e.position.includes("Manager") || e.position.includes("Directeur")) || deptEmployees[0],
      location: ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille"][Math.floor(Math.random() * 5)],
      budget: deptTotalSalary * 1.3, // Budget = salary + 30% overhead
    }
  }).sort((a, b) => b.totalEmployees - a.totalEmployees)

  const selectedDept = departmentStats.find((d) => d.name === selectedDepartment)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return "text-emerald-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 55) return "text-amber-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { label: "Excellent", variant: "default" as const, color: "bg-emerald-100 text-emerald-700" }
    if (score >= 70) return { label: "Bon", variant: "secondary" as const, color: "bg-blue-100 text-blue-700" }
    if (score >= 55) return { label: "Moyen", variant: "outline" as const, color: "bg-amber-100 text-amber-700" }
    return { label: "À améliorer", variant: "destructive" as const, color: "bg-red-100 text-red-700" }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des départements</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, {user?.name}. Vue d'ensemble et gestion des départements.
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Building className="w-4 h-4 mr-2" />
          {departments.length} départements
        </Badge>
      </div>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentStats.map((dept) => {
          const performanceBadge = getPerformanceBadge(dept.performanceScore)
          return (
            <Card 
              key={dept.name} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedDepartment === dept.name ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedDepartment(dept.name)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <Badge className={performanceBadge.color}>
                    {performanceBadge.label}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {dept.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{dept.totalEmployees}</p>
                    <p className="text-xs text-muted-foreground">Employés</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{dept.activeEmployees}</p>
                    <p className="text-xs text-muted-foreground">Actifs</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Performance</span>
                    <span className={`font-medium ${getPerformanceColor(dept.performanceScore)}`}>
                      {dept.performanceScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={dept.performanceScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Satisfaction</span>
                    <span className="font-medium">{dept.satisfactionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={dept.satisfactionRate} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{formatCurrency(dept.budget)}</span>
                </div>

                {dept.manager && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(dept.manager.firstName, dept.manager.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {dept.manager.firstName} {dept.manager.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{dept.manager.position}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Department Details */}
      {selectedDept && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Détails du département: {selectedDept.name}
            </CardTitle>
            <CardDescription>Informations détaillées et employés du département</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Department Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Effectif</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{selectedDept.totalEmployees}</p>
                <p className="text-xs text-blue-600">{selectedDept.activeEmployees} actifs</p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Budget</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedDept.budget)}</p>
                <p className="text-xs text-emerald-600">Annuel</p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Performance</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{selectedDept.performanceScore.toFixed(1)}%</p>
                <p className="text-xs text-amber-600">Score global</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Satisfaction</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{selectedDept.satisfactionRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-600">Employés</p>
              </div>
            </div>

            {/* Department Employees */}
            <div>
              <h4 className="text-lg font-medium mb-4">Employés du département</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees
                  .filter((e) => e.department === selectedDept.name)
                  .map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(employee.firstName, employee.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                              {employee.status === "active" ? "Actif" : "Inactif"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(employee.salary)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs">{employee.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Department Actions */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un employé
              </Button>
              <Button variant="outline" size="sm">
                <Target className="w-4 h-4 mr-2" />
                Définir des objectifs
              </Button>
              <Button variant="outline" size="sm">
                <Award className="w-4 h-4 mr-2" />
                Évaluer la performance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
