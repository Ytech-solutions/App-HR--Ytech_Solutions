"use client"

import { useState, useEffect } from "react"
import { useEmployees } from "@/lib/employees-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Building,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Award,
  AlertCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  Download,
  UserPlus,
  UserCheck,
  UserX,
  Eye,
  Briefcase,
  Settings,
  Shield,
  Database,
  Server,
  Lock,
  Target,
  Moon,
  Sun,
} from "lucide-react"

export function UnifiedDashboard() {
  const { employees, departments, activityLogs } = useEmployees()
  const { user } = useAuth()
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(savedDarkMode)
  }, [])

  // Toggle dark mode
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

  // Calculate metrics
  const activeEmployees = employees.filter((e) => e.status === "active").length
  const inactiveEmployees = employees.filter((e) => e.status === "inactive").length
  const totalSalary = employees.reduce((acc, e) => acc + e.salary, 0)
  const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0

  // Calculate growth metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthHires = employees.filter((e) => {
    const hireDate = new Date(e.hireDate)
    return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear
  }).length
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  
  const lastMonthHires = employees.filter((e) => {
    const hireDate = new Date(e.hireDate)
    return hireDate.getMonth() === lastMonth && hireDate.getFullYear() === lastMonthYear
  }).length
  
  const hireGrowth = lastMonthHires > 0 ? ((thisMonthHires - lastMonthHires) / lastMonthHires) * 100 : 0

  // Performance metrics - calculés dynamiquement
  // Satisfaction basée sur l'activité et l'engagement
  const activeRatio = employees.length > 0 ? activeEmployees / employees.length : 0
  const employeeSatisfaction = Math.min(95, 60 + (activeRatio * 35)) // 60-95% basé sur le ratio d'actifs
  
  // Croissance basée sur les embauches réelles
  const companyGrowth = Math.max(0, hireGrowth)
  
  // Rétention basée sur les employés actifs vs total
  const retentionRate = employees.length > 0 ? (activeEmployees / employees.length) * 100 : 0

  // Department analytics - calculés dynamiquement
  const departmentStats = departments.map((dept) => {
    const deptEmployees = employees.filter((e) => e.department === dept)
    const activeDeptEmployees = deptEmployees.filter((e) => e.status === "active")
    const deptTotalSalary = deptEmployees.reduce((acc, e) => acc + e.salary, 0)
    const deptAvgSalary = deptEmployees.length > 0 ? deptTotalSalary / deptEmployees.length : 0
    
    // Performance basée sur le salaire moyen et le taux d'activité
    const salaryScore = deptAvgSalary > avgSalary ? Math.min(100, 50 + (deptAvgSalary / avgSalary) * 25) : Math.max(40, 50 - (avgSalary / deptAvgSalary) * 25)
    const activityScore = deptEmployees.length > 0 ? (activeDeptEmployees / deptEmployees.length) * 100 : 0
    const performanceScore = (salaryScore + activityScore) / 2
    
    // Satisfaction basée sur la performance et l'activité
    const satisfactionRate = Math.min(95, Math.max(60, performanceScore + 10))
    
    // Récents embauches (3 derniers mois)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const recentHires = deptEmployees.filter((e) => new Date(e.hireDate) > threeMonthsAgo).length
    
    // Manager réel ou premier employé
    const manager = deptEmployees.find((e) => 
      e.position.toLowerCase().includes("manager") || 
      e.position.toLowerCase().includes("directeur") ||
      e.position.toLowerCase().includes("chef")
    ) || deptEmployees[0]
    
    // Location basée sur le département (réelle ou par défaut)
    const locationMap: Record<string, string> = {
      "IT": "Paris",
      "RH": "Lyon", 
      "Marketing": "Marseille",
      "Ventes": "Bordeaux",
      "Finance": "Lille"
    }
    const location = locationMap[dept] || "Paris"
    
    // Budget = salaire + 30% de charges
    const budget = deptTotalSalary * 1.3
    
    return {
      name: dept,
      totalEmployees: deptEmployees.length,
      activeEmployees: activeDeptEmployees.length,
      totalSalary: deptTotalSalary,
      avgSalary: deptAvgSalary,
      performanceScore: performanceScore,
      satisfactionRate: satisfactionRate,
      recentHires: recentHires,
      manager: manager,
      location: location,
      budget: budget,
    }
  }).sort((a, b) => b.totalEmployees - a.totalEmployees)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-MA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-MA", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 55) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard {user?.role === "CEO" ? "Directeur Général" : user?.role === "RH" ? "Ressources Humaines" : user?.role === "IT" ? "Administrateur" : user?.role}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bienvenue, {user?.name}. Vue complète de l'entreprise.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Temps réel
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="w-10 h-10 p-0 rounded-full"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main KPI Cards - More Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Total Employés</p>
                <p className="text-2xl font-bold text-foreground mt-1">{employees.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600">+{hireGrowth.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">vs mois dernier</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center ml-3">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Taux de rétention</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{retentionRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <Award className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Excellent</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center ml-3">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Satisfaction employés</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{employeeSatisfaction.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Très positif</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Masse salariale</p>
                <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(totalSalary)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Annuel</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center ml-3">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-9 max-w-md mx-auto sm:max-w-none">
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3 h-3" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-1 text-xs">
            <Building className="w-3 h-3" />
            Départements
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1 text-xs">
            <Activity className="w-3 h-3" />
            Activité
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Department Analytics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="w-4 h-4" />
                  Analyse par département
                </CardTitle>
                <CardDescription className="text-xs">Métriques détaillées par département</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {departmentStats.slice(0, 4).map((dept) => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{dept.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {dept.totalEmployees} employés
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Salaire:</span>
                          <span className="ml-1 font-medium">{formatCurrency(dept.avgSalary)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Productivité:</span>
                          <span className="ml-1 font-medium">{dept.performanceScore.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Taux d'activité</span>
                          <span className="font-medium">
                            {dept.totalEmployees > 0 ? ((dept.activeEmployees / dept.totalEmployees) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={dept.totalEmployees > 0 ? (dept.activeEmployees / dept.totalEmployees) * 100 : 0}
                          className="h-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Trends */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4" />
                  Tendances d'activité
                </CardTitle>
                <CardDescription className="text-xs">Dernières actions et tendances</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-emerald-50">
                      <p className="text-lg font-bold text-emerald-600">{thisMonthHires}</p>
                      <p className="text-xs text-muted-foreground">Nouveaux</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-50">
                      <p className="text-lg font-bold text-blue-600">{activeEmployees}</p>
                      <p className="text-xs text-muted-foreground">Actifs</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-amber-50">
                      <p className="text-lg font-bold text-amber-600">{inactiveEmployees}</p>
                      <p className="text-xs text-muted-foreground">Inactifs</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium">Activité récente</h4>
                    {activityLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {log.action === "add" ? "Ajout" : log.action === "update" ? "Modif" : "Suppr"}
                          </Badge>
                          <span className="text-xs truncate">{log.employeeName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-4 h-4" />
                Insights et recommandations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-emerald-800">Croissance positive</h4>
                      <p className="text-xs text-emerald-600 mt-1">
                        {hireGrowth > 0 
                          ? `L'entreprise est en phase de croissance avec ${thisMonthHires} nouvelle(s) embauche(s) ce mois-ci.` 
                          : "Stabilisation des effectifs, période de consolidation."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-blue-800">Engagement élevé</h4>
                      <p className="text-xs text-blue-600 mt-1">
                        Taux de satisfaction de {employeeSatisfaction.toFixed(0)}% avec {activeEmployees} employés actifs sur {employees.length}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-amber-800">Optimisation</h4>
                      <p className="text-xs text-amber-600 mt-1">
                        {inactiveEmployees > employees.length * 0.1 
                          ? `${inactiveEmployees} employés inactifs nécessitent une attention particulière pour optimiser les ressources.` 
                          : "Bonne répartition actifs/inactifs dans l'entreprise."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentStats.map((dept) => {
              const performanceColor = dept.performanceScore >= 85 ? "bg-emerald-100 text-emerald-700" : 
                                   dept.performanceScore >= 70 ? "bg-blue-100 text-blue-700" : 
                                   dept.performanceScore >= 55 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              const performanceLabel = dept.performanceScore >= 85 ? "Excellent" : 
                                      dept.performanceScore >= 70 ? "Bon" : 
                                      dept.performanceScore >= 55 ? "Moyen" : "À améliorer"
              
              return (
                <Card 
                  key={dept.name} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDepartment === dept.name ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedDepartment(dept.name)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{dept.name}</CardTitle>
                      <Badge className={`text-xs px-1 py-0 ${performanceColor}`}>
                        {performanceLabel}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="w-3 h-3" />
                      {dept.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{dept.totalEmployees}</p>
                        <p className="text-xs text-muted-foreground">Employés</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{dept.activeEmployees}</p>
                        <p className="text-xs text-muted-foreground">Actifs</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Performance</span>
                        <span className={`font-medium ${getScoreColor(dept.performanceScore)}`}>
                          {dept.performanceScore.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={dept.performanceScore} className="h-1" />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{formatCurrency(dept.budget)}</span>
                    </div>

                    {dept.manager && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(dept.manager.firstName, dept.manager.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {dept.manager.firstName} {dept.manager.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{dept.manager.position}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Department Details */}
          {selectedDepartment && (() => {
            const selectedDept = departmentStats.find((d) => d.name === selectedDepartment)
            if (!selectedDept) return null

            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="w-4 h-4" />
                    Détails: {selectedDept.name}
                  </CardTitle>
                  <CardDescription className="text-xs">Informations détaillées et employés</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Effectif</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{selectedDept.totalEmployees}</p>
                      <p className="text-xs text-blue-600">{selectedDept.activeEmployees} actifs</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-800">Budget</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedDept.budget)}</p>
                      <p className="text-xs text-emerald-600">Annuel</p>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-800">Performance</span>
                      </div>
                      <p className="text-lg font-bold text-amber-600">{selectedDept.performanceScore.toFixed(1)}%</p>
                      <p className="text-xs text-amber-600">Score global</p>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-3 h-3 text-purple-600" />
                        <span className="text-xs font-medium text-purple-800">Satisfaction</span>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{selectedDept.satisfactionRate.toFixed(1)}%</p>
                      <p className="text-xs text-purple-600">Employés</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      <UserPlus className="w-3 h-3 mr-1" />
                      Ajouter
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      <Target className="w-3 h-3 mr-1" />
                      Objectifs
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      <Award className="w-3 h-3 mr-1" />
                      Évaluer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })()}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {/* Dynamic Activity Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Actions aujourd'hui</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {activityLogs.filter(log => {
                        const today = new Date()
                        const logDate = new Date(log.timestamp)
                        return logDate.toDateString() === today.toDateString()
                      }).length}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600">
                        {(() => {
                          const yesterday = new Date()
                          yesterday.setDate(yesterday.getDate() - 1)
                          const yesterdayCount = activityLogs.filter(log => {
                            const logDate = new Date(log.timestamp)
                            return logDate.toDateString() === yesterday.toDateString()
                          }).length
                          const todayCount = activityLogs.filter(log => {
                            const today = new Date()
                            const logDate = new Date(log.timestamp)
                            return logDate.toDateString() === today.toDateString()
                          }).length
                          const growth = yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : 0
                          return growth > 0 ? `+${growth.toFixed(0)}%` : growth < 0 ? `${growth.toFixed(0)}%` : "0%"
                        })()}
                      </span>
                      <span className="text-xs text-muted-foreground">vs hier</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Ajouts récents</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {activityLogs.filter(log => log.action === "add").length}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-full bg-emerald-200 rounded-full h-1">
                        <div 
                          className="bg-emerald-600 h-1 rounded-full" 
                          style={{ width: `${activityLogs.length > 0 ? (activityLogs.filter(log => log.action === "add").length / activityLogs.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {activityLogs.length > 0 ? `${((activityLogs.filter(log => log.action === "add").length / activityLogs.length) * 100).toFixed(0)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center ml-3">
                    <UserPlus className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Modifications</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {activityLogs.filter(log => log.action === "update").length}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-full bg-amber-200 rounded-full h-1">
                        <div 
                          className="bg-amber-600 h-1 rounded-full" 
                          style={{ width: `${activityLogs.length > 0 ? (activityLogs.filter(log => log.action === "update").length / activityLogs.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {activityLogs.length > 0 ? `${((activityLogs.filter(log => log.action === "update").length / activityLogs.length) * 100).toFixed(0)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center ml-3">
                    <Settings className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Suppressions</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {activityLogs.filter(log => log.action === "delete").length}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-full bg-red-200 rounded-full h-1">
                        <div 
                          className="bg-red-600 h-1 rounded-full" 
                          style={{ width: `${activityLogs.length > 0 ? (activityLogs.filter(log => log.action === "delete").length / activityLogs.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {activityLogs.length > 0 ? `${((activityLogs.filter(log => log.action === "delete").length / activityLogs.length) * 100).toFixed(0)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center ml-3">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4" />
                Activités récentes
              </CardTitle>
              <CardDescription className="text-xs">Dernières actions du système</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {activityLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.action === "add" ? "bg-emerald-100" :
                      log.action === "update" ? "bg-amber-100" :
                      log.action === "delete" ? "bg-red-100" : "bg-blue-100"
                    }`}>
                      {log.action === "add" ? <UserPlus className="w-4 h-4 text-emerald-600" /> :
                       log.action === "update" ? <Settings className="w-4 h-4 text-amber-600" /> :
                       log.action === "delete" ? <UserX className="w-4 h-4 text-red-600" /> :
                       <Activity className="w-4 h-4 text-blue-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.employeeName}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {log.action === "add" ? "Ajout" :
                           log.action === "update" ? "Modification" :
                           log.action === "delete" ? "Suppression" : log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(() => {
                            const now = new Date()
                            const logTime = new Date(log.timestamp)
                            const diffMs = now.getTime() - logTime.getTime()
                            const diffMins = Math.floor(diffMs / (1000 * 60))
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                            
                            if (diffMins < 1) return "à l'instant"
                            if (diffMins < 60) return `il y a ${diffMins} min`
                            if (diffHours < 24) return `il y a ${diffHours}h`
                            if (diffDays < 7) return `il y a ${diffDays}j`
                            return formatDateShort(log.timestamp)
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.action === "add" ? "Nouvel employé ajouté" :
                         log.action === "update" ? "Informations mises à jour" :
                         log.action === "delete" ? "Employé supprimé" : "Action système"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Activity Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Activity by Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4" />
                  Répartition par type
                </CardTitle>
                <CardDescription className="text-xs">Distribution des actions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {["add", "update", "delete"].map((action) => {
                    const count = activityLogs.filter(log => log.action === action).length
                    const percentage = activityLogs.length > 0 ? (count / activityLogs.length) * 100 : 0
                    const colors = {
                      add: "bg-emerald-500",
                      update: "bg-amber-500", 
                      delete: "bg-red-500"
                    }
                    const labels = {
                      add: "Ajouts",
                      update: "Modifications",
                      delete: "Suppressions"
                    }
                    
                    return (
                      <div key={action} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{labels[action as keyof typeof labels]}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{count}</span>
                            <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`${colors[action as keyof typeof colors]} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activity by Hour */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4" />
                  Activité par heure
                </CardTitle>
                <CardDescription className="text-xs">Distribution horaire</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {(() => {
                    const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
                      const hour = i
                      const count = activityLogs.filter(log => {
                        const logHour = new Date(log.timestamp).getHours()
                        return logHour === hour
                      }).length
                      return { hour, count }
                    }).filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 6)

                    return hourlyActivity.map(({ hour, count }) => (
                      <div key={hour} className="flex items-center justify-between text-xs">
                        <span className="font-medium">{hour}h - {hour + 1}h</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full" 
                              style={{ width: `${Math.min(100, (count / Math.max(...hourlyActivity.map(h => h.count))) * 100)}%` }}
                            />
                          </div>
                          <span className="font-bold w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Most Active Users */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4" />
                  Utilisateurs actifs
                </CardTitle>
                <CardDescription className="text-xs">Top 5 par actions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {(() => {
                    const userActivity = activityLogs.reduce((users, log) => {
                      if (!users[log.employeeName]) {
                        users[log.employeeName] = { count: 0, lastAction: new Date(log.timestamp) }
                      }
                      users[log.employeeName].count++
                      users[log.employeeName].lastAction = new Date(log.timestamp)
                      return users
                    }, {} as Record<string, { count: number; lastAction: Date }>)

                    return Object.entries(userActivity)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 5)
                      .map(([name, data], index) => (
                        <div key={name} className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">
                              Dernière: {(() => {
                                const now = new Date()
                                const diffMs = now.getTime() - data.lastAction.getTime()
                                const diffMins = Math.floor(diffMs / (1000 * 60))
                                if (diffMins < 1) return "à l'instant"
                                if (diffMins < 60) return `il y a ${diffMins} min`
                                return formatDateShort(data.lastAction.toISOString())
                              })()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{data.count}</p>
                            <p className="text-xs text-muted-foreground">actions</p>
                          </div>
                        </div>
                      ))
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
