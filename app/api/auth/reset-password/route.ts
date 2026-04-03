import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { AuthUtils } from "@/lib/auth-utils"
import { emailService } from "@/lib/email-service"
import {
  checkRateLimit,
  getClientIp,
  resetPasswordConfirmSchema,
  resetPasswordRequestSchema,
  tooManyRequestsResponse,
} from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const body = resetPasswordRequestSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const { email } = body.data
    const rateLimit = checkRateLimit(`reset-request:${ip}:${email}`, 15 * 60 * 1000, 5)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(rateLimit.retryAfterSeconds)
    }

    // Vérifier si l'email existe dans la base de données
    const userAccount = await prisma.userAccount.findUnique({
      where: { email },
      include: {
        employee: true
      }
    })

    if (!userAccount) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
      return NextResponse.json({ message: "Si cet email existe dans notre système, vous recevrez un email de réinitialisation" })
    }

    // Générer un token de réinitialisation
    const resetToken = AuthUtils.generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Mettre à jour le compte utilisateur avec le token
    await prisma.userAccount.update({
      where: { id: userAccount.id },
      data: {
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date()
      }
    })

    // Envoyer l'email de réinitialisation
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken)

    if (!emailSent) {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 })
    }

    return NextResponse.json({ message: "Email de réinitialisation envoyé avec succès" })

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const body = resetPasswordConfirmSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json({ error: "Token ou mot de passe invalide" }, { status: 400 })
    }

    const { token, newPassword } = body.data
    const rateLimit = checkRateLimit(`reset-confirm:${ip}`, 15 * 60 * 1000, 10)
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(rateLimit.retryAfterSeconds)
    }

    // Valider la force du mot de passe
    const passwordValidation = AuthUtils.validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    // Trouver le compte utilisateur avec le token de réinitialisation
    const userAccount = await prisma.userAccount.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!userAccount) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 })
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await AuthUtils.hashPassword(newPassword)

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.userAccount.update({
      where: { id: userAccount.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" })

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
