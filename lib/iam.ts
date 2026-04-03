export type AppRole = "ADMIN" | "RH" | "EMPLOYE"
export type LegacyRole = "IT" | "CEO"
export type AnyRole = AppRole | LegacyRole | string

const ROLE_ALIASES: Record<string, AppRole> = {
  ADMIN: "ADMIN",
  RH: "RH",
  EMPLOYE: "EMPLOYE",
  EMPLOYEE: "EMPLOYE",
  IT: "ADMIN",
  CEO: "EMPLOYE",
}

export function normalizeRole(role: AnyRole): AppRole {
  const normalized = ROLE_ALIASES[String(role || "").toUpperCase()]
  return normalized || "EMPLOYE"
}

export function getRoleLabel(role: AnyRole): string {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "Admin"
    case "RH":
      return "RH"
    default:
      return "Employe"
  }
}
