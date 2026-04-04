import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.json({
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      showAdult: session.user.showAdult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name : undefined;
    const showAdult =
      typeof body?.showAdult === "boolean" ? body.showAdult : undefined;
    const image =
      typeof body?.image === "string"
        ? body.image
        : body?.image === null
          ? null
          : undefined;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(showAdult !== undefined ? { showAdult } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 },
    );
  }
}
