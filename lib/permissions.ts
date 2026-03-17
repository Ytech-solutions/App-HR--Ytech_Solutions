export type Permission = "view_dashboard" | "view_employees" | "add_employee" | "edit_employee" | "delete_employee" | "view_details" | "manage_accounts" | "manage_settings" | "change_password"

export interface RolePermissions {
  role: string
  permissions: Permission[]
  description: string
}

export const rolePermissions: RolePermissions[] = [
  {
    role: "IT",
    permissions: ["view_dashboard", "view_employees", "add_employee", "edit_employee", "delete_employee", "view_details", "manage_accounts", "manage_settings", "change_password"],
    description: "Admin IT - Accès complet à toutes les interfaces"
  },
  {
    role: "RH", 
    permissions: ["view_dashboard", "view_employees", "add_employee", "edit_employee", "view_details", "change_password"],
    description: "RH - Gestion des employés (sans suppression), pas d'accès aux comptes"
  },
  {
    role: "CEO",
    permissions: ["view_dashboard", "view_employees", "view_details", "manage_accounts", "change_password"],
    description: "CEO Directeur Général - Accès lecture seule avec visualisation des comptes"
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
