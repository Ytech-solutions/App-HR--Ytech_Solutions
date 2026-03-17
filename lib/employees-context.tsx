"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Employee, ActivityLog, UserAccount, AccountPermission } from "./types"
import { useAuth } from "./auth-context"
import { generatePassword } from "./data"

interface EmployeesContextType {
  employees: Employee[]
  activityLogs: ActivityLog[]
  userAccounts: UserAccount[]
  departments: string[]
  addEmployee: (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => Promise<void>
  getEmployeeById: (id: string) => Employee | undefined
  addDepartment: (name: string) => Promise<boolean>
  removeDepartment: (name: string) => boolean
  refreshDepartments: () => Promise<void>
  createUserAccount: (employeeId: string, permissions: AccountPermission[]) => { email: string; password: string } | null
  updateUserAccount: (accountId: string, updates: Partial<UserAccount>) => void
  toggleAccountStatus: (accountId: string) => void
  getAccountByEmployeeId: (employeeId: string) => UserAccount | undefined
}

const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined)

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const depts = await response.json()
        setDepartments(depts)
      }
    } catch (error) {
      // Error fetching departments
    }
  }

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      // Error fetching employees
    } finally {
      setLoading(false)
    }
  }

  // Fetch user accounts from API
  const fetchUserAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const accounts = await response.json()
        setUserAccounts(accounts)
        
        // Update employees hasAccount status based on accounts
        setEmployees((prev) =>
          prev.map((emp) => ({
            ...emp,
            hasAccount: accounts.some((acc: UserAccount) => acc.employeeId === emp.id),
            accountId: accounts.find((acc: UserAccount) => acc.employeeId === emp.id)?.id
          }))
        )
      }
    } catch (error) {
      // Error fetching user accounts
    }
  }

  useEffect(() => {
    fetchEmployees()
    fetchUserAccounts()
    fetchDepartments()
  }, [])

  const addActivityLog = (
    action: ActivityLog["action"],
    employeeId: string,
    employeeName: string,
    details?: string
  ) => {
    if (!user) return
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      employeeId,
      employeeName,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
      details,
    }
    setActivityLogs((prev) => [newLog, ...prev])
  }

  const addEmployee = async (employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      })
      
      if (response.ok) {
        const newEmployee = await response.json()
        setEmployees((prev) => [...prev, newEmployee])
        
        // Refresh departments to get updated list
        await fetchDepartments()
        
        addActivityLog(
          "add",
          newEmployee.id,
          `${newEmployee.firstName} ${newEmployee.lastName}`,
          `Nouvel employé ajouté au département ${newEmployee.department}`
        )
      }
    } catch (error) {
      // Error adding employee
    }
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })
      
      if (response.ok) {
        const updatedEmployee = await response.json()
        setEmployees((prev) =>
          prev.map((emp) => emp.id === id ? updatedEmployee : emp)
        )
        
        // Refresh departments if department was changed
        if (updates.department) {
          await fetchDepartments()
        }
        
        const employee = employees.find((e) => e.id === id)
        if (employee) {
          addActivityLog(
            "update",
            id,
            `${employee.firstName} ${employee.lastName}`,
            "Informations mises à jour"
          )
        }
      }
    } catch (error) {
      // Error updating employee
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const employee = employees.find((e) => e.id === id)
        if (employee) {
          addActivityLog(
            "delete",
            id,
            `${employee.firstName} ${employee.lastName}`,
            `Employé supprimé du département ${employee.department}`
          )
        }
        setEmployees((prev) => prev.filter((emp) => emp.id !== id))
      }
    } catch (error) {
      // Error deleting employee
    }
  }

  const getEmployeeById = (id: string) => {
    return employees.find((emp) => emp.id === id)
  }

  const addDepartment = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() })
      })

      if (response.ok) {
        const newDepartment = await response.json()
        setDepartments(prev => [...prev, newDepartment.name])
        return true
      } else {
        const error = await response.json()
        // Failed to add department
        return false
      }
    } catch (error) {
      // Error adding department
      return false
    }
  }

  const removeDepartment = (name: string): boolean => {
    // Check if any employees are in this department
    const hasEmployees = employees.some((e) => e.department === name)
    if (hasEmployees) return false
    setDepartments((prev) => prev.filter((d) => d !== name))
    return true
  }

  const refreshDepartments = async () => {
    await fetchDepartments()
  }

  const createUserAccount = async (employeeId: string, permissions: AccountPermission[]): Promise<{ email: string; password: string } | null> => {
    const employee = employees.find((e) => e.id === employeeId)
    if (!employee || employee.hasAccount) return null

    const password = generatePassword()
    const now = new Date().toISOString()
    const accountId = `acc-${Date.now()}`

    const newAccount: UserAccount = {
      id: accountId,
      employeeId,
      email: employee.email,
      password,
      permissions,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.name || "System",
    }

    try {
      // Save to database via API
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      })

      if (response.ok) {
        const savedAccount = await response.json()
        
        // Update local state
        setUserAccounts((prev) => [...prev, savedAccount])
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId
              ? { ...emp, hasAccount: true, accountId }
              : emp
          )
        )

        addActivityLog(
          "account_created",
          employeeId,
          `${employee.firstName} ${employee.lastName}`,
          `Compte créé avec permissions: ${permissions.map(p => {
            switch(p) {
              case "read": return "Voir"
              case "add": return "Ajouter"
              case "edit": return "Modifier"
              case "delete": return "Supprimer"
            }
          }).join(", ")}`
        )

        return { email: employee.email, password }
      } else {
        // Failed to create account in database
        return null
      }
    } catch (error) {
      // Error creating account
      return null
    }
  }

  const updateUserAccount = async (accountId: string, updates: Partial<UserAccount>) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: accountId, ...updates }),
      })

      if (response.ok) {
        const updatedAccount = await response.json()
        
        // Update local state
        setUserAccounts((prev) =>
          prev.map((acc) =>
            acc.id === accountId
              ? { ...acc, ...updatedAccount }
              : acc
          )
        )

        const account = userAccounts.find((a) => a.id === accountId)
        if (account) {
          const employee = employees.find((e) => e.id === account.employeeId)
          if (employee) {
            addActivityLog(
              "account_updated",
              account.employeeId,
              `${employee.firstName} ${employee.lastName}`,
              "Compte utilisateur mis à jour"
            )
          }
        }
      }
    } catch (error) {
      // Error updating account
    }
  }

  const toggleAccountStatus = async (accountId: string) => {
    const account = userAccounts.find((a) => a.id === accountId)
    if (!account) return

    try {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: accountId, 
          isActive: !account.isActive,
          updatedAt: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const updatedAccount = await response.json()
        
        // Update local state
        setUserAccounts((prev) =>
          prev.map((acc) =>
            acc.id === accountId
              ? updatedAccount
              : acc
          )
        )
      }
    } catch (error) {
      // Error toggling account status
    }
  }

  const getAccountByEmployeeId = (employeeId: string) => {
    return userAccounts.find((acc) => acc.employeeId === employeeId)
  }

  return (
    <EmployeesContext.Provider
      value={{
        employees,
        activityLogs,
        userAccounts,
        departments,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        addDepartment,
        removeDepartment,
        refreshDepartments,
        createUserAccount,
        updateUserAccount,
        toggleAccountStatus,
        getAccountByEmployeeId,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  )
}

export function useEmployees() {
  const context = useContext(EmployeesContext)
  if (context === undefined) {
    throw new Error("useEmployees must be used within an EmployeesProvider")
  }
  return context
}
