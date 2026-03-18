import nodemailer from 'nodemailer'

interface EmailData {
  to: string
  subject: string
  html: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Configuration du transporteur d'email
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Pour Brevo/Mailtrap en développement
      }
    })
  }

  async sendWelcomeEmail(employeeName: string, email: string, temporaryPassword: string): Promise<boolean> {
    try {
      // Vérifier si les variables d'environnement SMTP sont configurées
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("Configuration SMTP manquante, email non envoyé")
        return false
      }

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenue chez Ytech RH</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .credentials {
              background: white;
              padding: 20px;
              border-radius: 5px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Bienvenue chez Ytech RH</h1>
            <p>Votre compte a été créé avec succès</p>
          </div>
          
          <div class="content">
            <p>Bonjour ${employeeName},</p>
            
            <p>Nous sommes ravis de vous accueillir dans notre système de gestion des ressources humaines. Un compte utilisateur a été créé pour vous avec les identifiants suivants :</p>
            
            <div class="credentials">
              <h3>📋 Vos identifiants de connexion</h3>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Mot de passe temporaire :</strong> <code style="background: #f0f0f0; padding: 5px; border-radius: 3px;">${temporaryPassword}</code></p>
            </div>
            
            <p>🔒 <strong>Important :</strong> Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
              🚀 Se connecter maintenant
            </a>
            
            <p><strong>Instructions de connexion :</strong></p>
            <ol>
              <li>Visitez notre plateforme Ytech RH</li>
              <li>Utilisez votre email et le mot de passe temporaire fourni</li>
              <li>Changez immédiatement votre mot de passe</li>
              <li>Explorez les fonctionnalités selon vos permissions</li>
            </ol>
            
            <p>Si vous avez des questions ou rencontrez des difficultés, n'hésitez pas à contacter le support IT.</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par Ytech RH System</p>
              <p>© 2024 Ytech Solutions. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `

      const mailOptions: EmailData = {
        to: email,
        subject: "🎉 Bienvenue chez Ytech RH - Vos identifiants de connexion",
        html: emailHtml
      }

      const result = await this.transporter.sendMail(mailOptions)
      return true

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error)
      return false
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation de mot de passe - Ytech RH</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #f5576c;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
            <p>Ytech RH System</p>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
            
            <a href="${resetLink}" class="button">
              🔑 Réinitialiser mon mot de passe
            </a>
            
            <p>⚠️ <strong>Important :</strong></p>
            <ul>
              <li>Ce lien expirera dans 1 heure</li>
              <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
              <li>Ne partagez jamais ce lien avec d'autres personnes</li>
            </ul>
            
            <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
            <p><code>${resetLink}</code></p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par Ytech RH System</p>
              <p>© 2024 Ytech Solutions. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `

      const mailOptions: EmailData = {
        to: email,
        subject: "🔐 Réinitialisation de mot de passe - Ytech RH",
        html: emailHtml
      }

      await this.transporter.sendMail(mailOptions)
      return true

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error)
      return false
    }
  }

  async sendTemporaryPasswordEmail(employeeName: string, email: string, temporaryPassword: string): Promise<boolean> {
    try {
      // Vérifier si les variables d'environnement SMTP sont configurées
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("Configuration SMTP manquante, email non envoyé")
        return false
      }

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation de mot de passe - Ytech RH</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #f5576c;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .credentials {
              background: white;
              padding: 20px;
              border-radius: 5px;
              border-left: 4px solid #f5576c;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Réinitialisation de votre mot de passe</h1>
            <p>Ytech RH System</p>
          </div>
          
          <div class="content">
            <p>Bonjour ${employeeName},</p>
            
            <p>Votre mot de passe a été réinitialisé par un administrateur. Voici vos nouveaux identifiants de connexion :</p>
            
            <div class="credentials">
              <h3>📋 Vos nouveaux identifiants</h3>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Nouveau mot de passe temporaire :</strong> <code style="background: #f0f0f0; padding: 5px; border-radius: 3px;">${temporaryPassword}</code></p>
            </div>
            
            <p>🔒 <strong>Important :</strong> Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre prochaine connexion.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
              🚀 Se connecter maintenant
            </a>
            
            <p><strong>Instructions :</strong></p>
            <ol>
              <li>Visitez notre plateforme Ytech RH</li>
              <li>Utilisez votre email et le nouveau mot de passe temporaire</li>
              <li>Changez immédiatement votre mot de passe</li>
            </ol>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, veuillez contacter immédiatement le support IT.</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par Ytech RH System</p>
              <p>© 2024 Ytech Solutions. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `

      const mailOptions: EmailData = {
        to: email,
        subject: "🔐 Réinitialisation de mot de passe - Ytech RH",
        html: emailHtml
      }

      const result = await this.transporter.sendMail(mailOptions)
      return true

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
