import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      employees.map((e) => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone,
        department: e.department.name,
        position: e.position,
        hireDate: e.hireDate.toISOString().split("T")[0],
        salary: e.salary,
        address: e.address,
        status: e.status === "active" ? "active" : "inactive",
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))
    )
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const dept = await prisma.department.upsert({
      where: { name: department },
      create: { name: department },
      update: {},
    })

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        hireDate: new Date(hireDate),
        salary: Number(salary),
        address,
        status,
        departmentId: dept.id,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

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
    } = updateData

    const dept = await prisma.department.upsert({
      where: { name: department },
      create: { name: department },
      update: {},
    })

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        hireDate: new Date(hireDate),
        salary: Number(salary),
        address,
        status,
        departmentId: dept.id,
      },
      include: {
        department: true,
      },
    })

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    // First delete associated activity logs
    await prisma.activityLog.deleteMany({
      where: { employeeId: id }
    })

    // Then delete associated user account if exists
    await prisma.userAccount.deleteMany({
      where: { employeeId: id }
    })

    // Finally delete the employee
    await prisma.employee.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Employé supprimé avec succès" })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

