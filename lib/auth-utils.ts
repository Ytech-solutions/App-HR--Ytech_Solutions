import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export class AuthUtils {
  // Génération de mot de passe temporaire sécurisé
  static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Hash du mot de passe
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  // Vérification du mot de passe
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  // Génération de token de réinitialisation
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Vérification de l'expiration du token (1 heure)
  static isTokenExpired(tokenTimestamp: string): boolean {
    const tokenTime = new Date(tokenTimestamp).getTime()
    const currentTime = new Date().getTime()
    const oneHour = 60 * 60 * 1000 // 1 heure en millisecondes
    return (currentTime - tokenTime) > oneHour
  }

  // Validation de la force du mot de passe
  static validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' }
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins une majuscule' }
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins une minuscule' }
    }
    
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins un chiffre' }
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' }
    }
    
    return { isValid: true, message: 'Mot de passe valide' }
  }

  // Génération de token de session
  static generateSessionToken(): string {
    return crypto.randomBytes(64).toString('hex')
  }

  // Validation de l'email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
