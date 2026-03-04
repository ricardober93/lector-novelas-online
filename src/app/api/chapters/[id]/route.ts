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
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        volume: {
          include: {
            series: {
              select: {
                id: true,
                title: true,
                isAdult: true,
                creatorId: true,
              },
            },
          },
        },
        pages: {
          orderBy: {
            number: "asc",
          },
        },
        _count: {
          select: {
            pages: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Capítulo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    logger.error("Error fetching chapter:", error);
    return NextResponse.json(
      { error: "Error al obtener capítulo" },
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

    const existingChapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        volume: {
          include: {
            series: {
              select: {
                creatorId: true,
              },
            },
          },
        },
      },
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: "Capítulo no encontrado" },
        { status: 404 }
      );
    }

    if (
      existingChapter.volume.series.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para editar este capítulo" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { number, title, status } = body;

    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        number,
        title,
        status,
      },
    });

    return NextResponse.json({ chapter });
  } catch (error) {
    logger.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Error al actualizar capítulo" },
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

    const existingChapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        volume: {
          include: {
            series: {
              select: {
                creatorId: true,
              },
            },
          },
        },
      },
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: "Capítulo no encontrado" },
        { status: 404 }
      );
    }

    if (
      existingChapter.volume.series.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar este capítulo" },
        { status: 403 }
      );
    }

    await prisma.chapter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Error al eliminar capítulo" },
      { status: 500 }
    );
  }
}
