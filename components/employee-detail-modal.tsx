"use client"

import type { Employee } from "@/lib/types"
import { displayDualCurrency } from "@/lib/currency-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  User,
  TrendingUp,
} from "lucide-react"

interface EmployeeDetailModalProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function EmployeeDetailModal({
  employee,
  open,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: EmployeeDetailModalProps) {

  if (!employee) return null

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const salaryDisplay = displayDualCurrency(employee.salary)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 ring-4 ring-primary/10 shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {employee.firstName} {employee.lastName}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {employee.position}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full">
                  <Building className="w-3.5 h-3.5 mr-1.5" />
                  {employee.department}
                </Badge>
                <Badge
                  className={`px-4 py-1.5 rounded-full ${
                    employee.status === "active"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {employee.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="text-sm font-semibold truncate">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Telephone</p>
                <p className="text-sm font-semibold">{employee.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Adresse</p>
                <p className="text-sm font-semibold">{employee.address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Embauche le</p>
              <p className="text-sm font-semibold mt-1">{formatDate(employee.hireDate)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">Salaire annuel</p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-bold text-amber-700">{salaryDisplay.eur}</p>
                  <div className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center">
                    <TrendingUp className="w-2.5 h-2.5 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-amber-600 font-medium">
                  <span>≈</span>
                  <span>{salaryDisplay.mad}</span>
                </div>
                <p className="text-xs text-amber-500/70">{salaryDisplay.rate}</p>
              </div>
            </div>
          </div>

          {employee.hasAccount && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-700">Cet employe a un compte d'acces a la plateforme</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">
            Fermer
          </Button>
          {canEdit && (
            <Button variant="secondary" onClick={onEdit} className="flex-1 h-11 rounded-xl">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={onDelete} className="h-11 px-4 rounded-xl">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
