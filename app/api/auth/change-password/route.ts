import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { AuthUtils } from '@/lib/auth-utils'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, userId } = await request.json()

    // Validation des entrées
    if (!currentPassword || !newPassword || !userId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Validation de la force du nouveau mot de passe
    const passwordValidation = AuthUtils.validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur actuel
    const user = await prisma.userAccount.findUnique({
      where: { id: userId },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le compte est actif
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Ce compte est désactivé' },
        { status: 403 }
      )
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await AuthUtils.verifyPassword(
      currentPassword,
      user.passwordHash
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Le mot de passe actuel est incorrect' },
        { status: 401 }
      )
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await AuthUtils.hashPassword(newPassword)

    // Mettre à jour le mot de passe dans la base de données
    const updatedUser = await prisma.userAccount.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Journaliser l'activité
    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_CHANGE',
        employeeId: user.employeeId,
        employeeName: `${user.employee?.firstName} ${user.employee?.lastName}`,
        userId: user.id,
        userName: user.email,
        timestamp: new Date(),
        details: 'Mot de passe modifié avec succès'
      }
    })

    // Retourner la réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du mot de passe' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Récupérer les informations de sécurité de l'utilisateur
    const user = await prisma.userAccount.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les derniers logs d'activité de sécurité
    const securityLogs = await prisma.activityLog.findMany({
      where: {
        userId: userId,
        action: {
          in: ['PASSWORD_CHANGE', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT']
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10,
      select: {
        action: true,
        timestamp: true,
        details: true
      }
    })

    return NextResponse.json({
      user: {
        ...user,
        lastPasswordChange: user.updatedAt
      },
      securityLogs,
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        description: "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial."
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des informations' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
