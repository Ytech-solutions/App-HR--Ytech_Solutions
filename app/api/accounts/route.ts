import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { AuthUtils } from "@/lib/auth-utils"
import { emailService } from "@/lib/email-service"
import { getPermissionsByRole } from "@/lib/permissions"

export async function GET() {
  try {
    const userAccounts = await prisma.userAccount.findMany({
      include: {
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(
      userAccounts.map((account: any) => ({
        id: account.id,
        employeeId: account.employeeId,
        email: account.email,
        role: account.role,
        permissions: getPermissionsByRole(account.role),
        canView: account.canView,
        canAdd: account.canAdd,
        canEdit: account.canEdit,
        canDelete: account.canDelete,
        isActive: account.isActive,
        avatar: account.avatar,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
        employee: account.employee ? {
          id: account.employee.id,
          firstName: account.employee.firstName,
          lastName: account.employee.lastName,
          department: account.employee.department.name,
          position: account.employee.position,
          status: account.employee.status
        } : null
      }))
    )
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, role } = body

    if (!employeeId || !role) {
      return NextResponse.json({ error: "ID employé et rôle requis" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["IT", "RH", "CEO"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Rôle invalide. Rôles valides: ${validRoles.join(", ")}` }, { status: 400 })
    }

    // Vérifier si l'employé existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 })
    }

    // Vérifier si un compte existe déjà
    const existingAccount = await prisma.userAccount.findFirst({
      where: { employeeId }
    })

    if (existingAccount) {
      return NextResponse.json({ error: "Un compte existe déjà pour cet employé" }, { status: 400 })
    }

    // Générer un mot de passe temporaire
    const temporaryPassword = AuthUtils.generateTemporaryPassword()
    const hashedPassword = await AuthUtils.hashPassword(temporaryPassword)

    // Définir les permissions selon le rôle
    const permissions = getPermissionsByRole(role)
    const canView = permissions.includes("view_dashboard") || permissions.includes("view_employees")
    const canAdd = permissions.includes("add_employee")
    const canEdit = permissions.includes("edit_employee")
    const canDelete = permissions.includes("delete_employee")

    // Créer le compte utilisateur
    const userAccount = await prisma.userAccount.create({
      data: {
        employeeId,
        email: employee.email,
        passwordHash: hashedPassword,
        role,
        canView,
        canAdd,
        canEdit,
        canDelete,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        employee: {
          include: {
            department: true
          }
        }
      }
    })

    // Envoyer l'email de bienvenue (non bloquant)
    let emailSent = false
    try {
      emailSent = await emailService.sendWelcomeEmail(
        `${employee.firstName} ${employee.lastName}`,
        employee.email,
        temporaryPassword
      )
    } catch (emailError) {
      emailSent = false
    }

    return NextResponse.json({
      id: userAccount.id,
      employeeId: userAccount.employeeId,
      email: userAccount.email,
      role: userAccount.role,
      permissions: getPermissionsByRole(userAccount.role),
      canView: userAccount.canView,
      canAdd: userAccount.canAdd,
      canEdit: userAccount.canEdit,
      canDelete: userAccount.canDelete,
      isActive: userAccount.isActive,
      avatar: userAccount.avatar,
      createdAt: userAccount.createdAt.toISOString(),
      updatedAt: userAccount.updatedAt.toISOString(),
      employee: userAccount.employee ? {
        id: userAccount.employee.id,
        firstName: userAccount.employee.firstName,
        lastName: userAccount.employee.lastName,
        department: userAccount.employee.department.name,
        position: userAccount.employee.position,
        status: userAccount.employee.status
      } : null,
      emailSent: emailSent,
      temporaryPassword: temporaryPassword
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, role, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    // Définir les permissions selon le rôle
    const permissions = getPermissionsByRole(role)
    const canView = permissions.includes("view_dashboard") || permissions.includes("view_employees")
    const canAdd = permissions.includes("add_employee")
    const canEdit = permissions.includes("edit_employee")
    const canDelete = permissions.includes("delete_employee")

    const updatedAccount = await prisma.userAccount.update({
      where: { id },
      data: {
        role,
        canView,
        canAdd,
        canEdit,
        canDelete,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      include: {
        employee: {
          include: {
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedAccount.id,
      employeeId: updatedAccount.employeeId,
      email: updatedAccount.email,
      role: updatedAccount.role,
      permissions: getPermissionsByRole(updatedAccount.role),
      canView: updatedAccount.canView,
      canAdd: updatedAccount.canAdd,
      canEdit: updatedAccount.canEdit,
      canDelete: updatedAccount.canDelete,
      isActive: updatedAccount.isActive,
      avatar: updatedAccount.avatar,
      createdAt: updatedAccount.createdAt.toISOString(),
      updatedAt: updatedAccount.updatedAt.toISOString(),
      employee: updatedAccount.employee ? {
        id: updatedAccount.employee.id,
        firstName: updatedAccount.employee.firstName,
        lastName: updatedAccount.employee.lastName,
        department: updatedAccount.employee.department.name,
        position: updatedAccount.employee.position,
        status: updatedAccount.employee.status
      } : null
    })

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    await prisma.userAccount.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Compte utilisateur supprimé avec succès" })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    // Vérifier si le compte existe
    const account = await prisma.userAccount.findUnique({
      where: { id },
      include: {
        employee: true
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 })
    }

    // Générer un nouveau mot de passe temporaire
    const temporaryPassword = AuthUtils.generateTemporaryPassword()
    const hashedPassword = await AuthUtils.hashPassword(temporaryPassword)

    // Mettre à jour le mot de passe
    const updatedAccount = await prisma.userAccount.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date()
      },
      include: {
        employee: {
          include: {
            department: true
          }
        }
      }
    })

    // Envoyer l'email de réinitialisation (non bloquant)
    let emailSent = false
    try {
      if (account.employee) {
        emailSent = await emailService.sendTemporaryPasswordEmail(
          `${account.employee.firstName} ${account.employee.lastName}`,
          account.email,
          temporaryPassword
        )
      }
    } catch (emailError) {
      emailSent = false
    }

    return NextResponse.json({
      message: "Mot de passe réinitialisé avec succès",
      temporaryPassword: temporaryPassword,
      emailSent: emailSent,
      account: {
        id: updatedAccount.id,
        email: updatedAccount.email,
        employee: updatedAccount.employee ? {
          firstName: updatedAccount.employee.firstName,
          lastName: updatedAccount.employee.lastName
        } : null
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
