import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { normalizeEmail, resolveRoleForEmail } from "@/lib/admin-user";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const editableRoles = new Set<Role>([Role.CREATOR, Role.ADMIN]);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toUserPayload(user: {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  showAdult: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    showAdult: user.showAdult,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role")?.trim().toUpperCase();

    const users = await prisma.user.findMany({
      where:
        role && editableRoles.has(role as Role)
          ? { role: role as Role }
          : undefined,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        showAdult: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      users: users.map(toUserPayload),
    });
  } catch (error) {
    logger.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const role =
      typeof body?.role === "string" ? body.role.trim().toUpperCase() : "";
    const showAdult =
      typeof body?.showAdult === "boolean" ? body.showAdult : undefined;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 },
      );
    }

    if (!editableRoles.has(role as Role)) {
      return NextResponse.json(
        { error: "Role debe ser CREATOR o ADMIN" },
        { status: 400 },
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: resolveRoleForEmail(email, role as Role),
        emailVerified: true,
        ...(name !== undefined ? { name } : {}),
        ...(showAdult !== undefined ? { showAdult } : {}),
      },
      create: {
        email,
        name,
        role: resolveRoleForEmail(email, role as Role),
        emailVerified: true,
        showAdult: showAdult ?? false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        showAdult: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        user: toUserPayload(user),
        message: "Usuario creado o actualizado correctamente",
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 },
    );
  }
}
