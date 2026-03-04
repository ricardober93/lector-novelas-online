import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
        volumes: {
          include: {
            _count: {
              select: {
                chapters: true,
              },
            },
          },
          orderBy: {
            number: "asc",
          },
        },
        _count: {
          select: {
            volumes: true,
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: "Serie no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ series });
  } catch (error) {
    logger.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Error al obtener serie" },
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

    const existingSeries = await prisma.series.findUnique({
      where: { id },
    });

    if (!existingSeries) {
      return NextResponse.json(
        { error: "Serie no encontrada" },
        { status: 404 }
      );
    }

    if (
      existingSeries.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta serie" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, type, isAdult, coverImage, status } = body;

    const series = await prisma.series.update({
      where: { id },
      data: {
        title,
        description,
        type,
        isAdult,
        coverImage,
        status,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ series });
  } catch (error) {
    logger.error("Error updating series:", error);
    return NextResponse.json(
      { error: "Error al actualizar serie" },
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

    const existingSeries = await prisma.series.findUnique({
      where: { id },
    });

    if (!existingSeries) {
      return NextResponse.json(
        { error: "Serie no encontrada" },
        { status: 404 }
      );
    }

    if (
      existingSeries.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta serie" },
        { status: 403 }
      );
    }

    await prisma.series.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting series:", error);
    return NextResponse.json(
      { error: "Error al eliminar serie" },
      { status: 500 }
    );
  }
}
