import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.userAccount.findUnique({
      where: { email: email },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Ce compte est désactivé. Veuillez contacter l\'administrateur.' }, { status: 401 });
    }

    const validPassword = bcrypt.compareSync(password, user.passwordHash);
    
    if (!validPassword) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    // Create session
    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.employee?.firstName && user.employee?.lastName 
        ? `${user.employee.firstName} ${user.employee.lastName}` 
        : user.email.split('@')[0],
      avatar: user.avatar,
      permissions: {
        canView: user.canView,
        canAdd: user.canAdd,
        canEdit: user.canEdit,
        canDelete: user.canDelete,
      },
    };

    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ user: sessionData });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
