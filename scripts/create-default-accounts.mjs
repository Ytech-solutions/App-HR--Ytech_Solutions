import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const defaultAccounts = [
  {
    email: 'admin@ytech.com',
    password: 'demo123',
    role: 'IT',
    firstName: 'Admin',
    lastName: 'System',
    phone: '+212600000000',
    position: 'Administrateur Système',
    departmentId: null, // Sera mis à jour après création
    hireDate: new Date(),
    salary: 0,
    address: 'System',
    status: 'active' // Changé de 'Actif' à 'active' pour correspondre au schema Prisma
  }
]

async function createDefaultAccounts() {
  try {

    // D'abord, créer ou récupérer un département par défaut
    let defaultDepartment = await prisma.department.findFirst({
      where: { name: 'Administration' }
    })

    if (!defaultDepartment) {
      defaultDepartment = await prisma.department.create({
        data: {
          name: 'Administration'
        }
      })
    }

    // Permissions selon le rôle
    const rolePermissions = {
      IT: {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true
      },
      RH: {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: false
      },
      CEO: {
        canView: true,
        canAdd: false,
        canEdit: false,
        canDelete: false
      },
    }

    for (const account of defaultAccounts) {
      try {
        // Vérifier si l'employé existe déjà
        let employee = await prisma.employee.findUnique({
          where: { email: account.email }
        })

        if (!employee) {
          // Créer l'employé d'abord
          employee = await prisma.employee.create({
            data: {
              firstName: account.firstName,
              lastName: account.lastName,
              email: account.email,
              phone: account.phone,
              position: account.position,
              departmentId: defaultDepartment.id,
              hireDate: account.hireDate,
              salary: account.salary,
              address: account.address,
              status: account.status
            }
          })
        } else {
          // L'employé existe déjà
        }

        // Vérifier si le compte utilisateur existe déjà
        const existingAccount = await prisma.userAccount.findUnique({
          where: { email: account.email }
        })

        if (!existingAccount) {
          // Hasher le mot de passe avec plus de tours pour plus de sécurité
          const saltRounds = 12
          const hashedPassword = await bcrypt.hash(account.password, saltRounds)

          // Créer le compte utilisateur
          const userAccount = await prisma.userAccount.create({
            data: {
              employeeId: employee.id,
              email: account.email,
              passwordHash: hashedPassword,
              role: account.role,
              ...rolePermissions[account.role],
              isActive: true
            }
          })
        } else {
          // Le compte utilisateur existe déjà
        }
      } catch (accountError) {
        continue // Continuer avec le compte suivant
      }
    }

  } catch (error) {
  } finally {
    await prisma.$disconnect()
  }
}

// Vérifier que nous pouvons nous connecter à la base de données avant de commencer
async function main() {
  try {
    await prisma.$connect()
    await createDefaultAccounts()
  } catch (error) {
    process.exit(1)
  }
}

main()
