export type Permission = "view_dashboard" | "view_employees" | "add_employee" | "edit_employee" | "delete_employee" | "view_details" | "manage_accounts" | "manage_settings" | "change_password"

export interface RolePermissions {
  role: string
  permissions: Permission[]
  description: string
}

export const rolePermissions: RolePermissions[] = [
  {
    role: "ADMIN",
    permissions: ["view_dashboard", "view_employees", "add_employee", "edit_employee", "delete_employee", "view_details", "manage_accounts", "manage_settings", "change_password"],
    description: "Admin - Acces complet a toutes les interfaces"
  },
  {
    role: "RH", 
    permissions: ["view_dashboard", "view_employees", "add_employee", "edit_employee", "view_details", "change_password"],
    description: "RH - Gestion des employes (sans suppression), pas d'acces aux comptes"
  },
  {
    role: "EMPLOYE",
    permissions: ["view_dashboard", "view_details", "change_password"],
    description: "Employe - Acces limite a son espace et son profil"
  }
]

export function getPermissionsByRole(role: string): Permission[] {
  const roleConfig = rolePermissions.find(r => r.role === role)
  return roleConfig?.permissions || []
}

export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission)
}

export function getRoleDescription(role: string): string {
  const roleConfig = rolePermissions.find(r => r.role === role)
  return roleConfig?.description || "Rôle non défini"
}
