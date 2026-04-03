import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp, loginBodySchema, tooManyRequestsResponse } from '@/lib/security';
import { normalizeRole } from '@/lib/iam';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const parsedBody = loginBodySchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Entrées invalides' }, { status: 400 });
    }

    const { email, password } = parsedBody.data;

    const rateLimit = checkRateLimit(`login:${ip}:${email}`, 15 * 60 * 1000, 8);
    if (!rateLimit.allowed) {
      return tooManyRequestsResponse(rateLimit.retryAfterSeconds);
    }

    const user = await prisma.userAccount.findUnique({
      where: { email },
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
    const normalizedRole = normalizeRole(user.role)
    const sessionData = {
      id: user.id,
      email: user.email,
      role: normalizedRole,
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
      sameSite: 'strict',
      maxAge: 60 * 60 * 12, // 12 hours
      path: '/',
    });

    return NextResponse.json({ user: sessionData });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
