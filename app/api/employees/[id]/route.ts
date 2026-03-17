import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { department: true },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employé introuvable" }, { status: 404 })
    }

    return NextResponse.json({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department.name,
      position: employee.position,
      hireDate: employee.hireDate.toISOString().split("T")[0],
      salary: employee.salary,
      address: employee.address,
      status: employee.status === "active" ? "active" : "inactive",
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      hireDate,
      salary,
      address,
      status,
    } = body

    const existing = await prisma.employee.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: "Employé introuvable" }, { status: 404 })
    }

    const dept = department
      ? await prisma.department.upsert({
          where: { name: department },
          create: { name: department },
          update: {},
        })
      : await prisma.department.findUnique({ where: { id: existing.departmentId } })

    const updated = await prisma.employee.update({
      where: { id: params.id },
      data: {
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        email: email ?? existing.email,
        phone: phone ?? existing.phone,
        position: position ?? existing.position,
        hireDate: hireDate ? new Date(hireDate) : existing.hireDate,
        salary: salary !== undefined ? Number(salary) : existing.salary,
        address: address ?? existing.address,
        status: status ?? existing.status,
        departmentId: dept ? dept.id : existing.departmentId,
      },
      include: { department: true },
    })

    return NextResponse.json({
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      department: updated.department.name,
      position: updated.position,
      hireDate: updated.hireDate.toISOString().split("T")[0],
      salary: updated.salary,
      address: updated.address,
      status: updated.status === "active" ? "active" : "inactive",
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await prisma.employee.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

