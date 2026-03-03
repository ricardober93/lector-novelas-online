import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const volume = await prisma.volume.findUnique({
      where: { id },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
        chapters: {
          orderBy: {
            number: "asc",
          },
        },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });

    if (!volume) {
      return NextResponse.json(
        { error: "Volumen no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ volume });
  } catch (error) {
    console.error("Error fetching volume:", error);
    return NextResponse.json(
      { error: "Error al obtener volumen" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const existingVolume = await prisma.volume.findUnique({
      where: { id },
      include: {
        series: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!existingVolume) {
      return NextResponse.json(
        { error: "Volumen no encontrado" },
        { status: 404 }
      );
    }

    if (
      existingVolume.series.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para editar este volumen" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { number, title } = body;

    const volume = await prisma.volume.update({
      where: { id },
      data: {
        number,
        title,
      },
    });

    return NextResponse.json({ volume });
  } catch (error) {
    console.error("Error updating volume:", error);
    return NextResponse.json(
      { error: "Error al actualizar volumen" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const existingVolume = await prisma.volume.findUnique({
      where: { id },
      include: {
        series: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!existingVolume) {
      return NextResponse.json(
        { error: "Volumen no encontrado" },
        { status: 404 }
      );
    }

    if (
      existingVolume.series.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar este volumen" },
        { status: 403 }
      );
    }

    await prisma.volume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting volume:", error);
    return NextResponse.json(
      { error: "Error al eliminar volumen" },
      { status: 500 }
    );
  }
}
