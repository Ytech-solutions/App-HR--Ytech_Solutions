import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(departments.map(dept => dept.name))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    })

    if (existingDepartment) {
      return NextResponse.json({ error: 'Department already exists' }, { status: 409 })
    }

    // Create new department
    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim()
      }
    })

    return NextResponse.json(newDepartment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}
