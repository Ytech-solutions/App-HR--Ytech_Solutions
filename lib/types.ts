export type Department = string

export type UserRole = "ADMIN" | "RH" | "EMPLOYE"

export type AccountPermission = "read" | "add" | "edit" | "delete"

export interface UserAccount {
  id: string
  employeeId: string
  email: string
  password: string
  permissions: AccountPermission[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: Department
  position: string
  hireDate: string
  salary: number
  address: string
  status: "active" | "inactive"
  photo?: string
  createdAt: string
  updatedAt: string
  hasAccount?: boolean
  accountId?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface ActivityLog {
  id: string
  action: "add" | "update" | "delete" | "account_created" | "account_updated"
  employeeId: string
  employeeName: string
  userId: string
  userName: string
  timestamp: string
  details?: string
}
