import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const history = await prisma.readingHistory.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        chapter: {
          include: {
            volume: {
              include: {
                series: {
                  select: {
                    id: true,
                    title: true,
                    isAdult: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({ history });
  } catch (error) {
    logger.error("Error fetching reading history:", error);
    return NextResponse.json(
      { error: "Error al obtener historial" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { chapterId, lastPage } = body;

    if (!chapterId || lastPage === undefined) {
      return NextResponse.json(
        { error: "chapterId y lastPage son requeridos" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        volume: {
          include: {
            series: {
              select: {
                isAdult: true,
              },
            },
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

    if (chapter.volume.series.isAdult && !session.user.showAdult) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este contenido" },
        { status: 403 }
      );
    }

    const progress = (lastPage / chapter.pageCount) * 100;

    const history = await prisma.readingHistory.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
      update: {
        lastPage,
        progress,
      },
      create: {
        userId: session.user.id,
        chapterId,
        lastPage,
        progress,
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    logger.error("Error updating reading history:", error);
    return NextResponse.json(
      { error: "Error al actualizar historial" },
      { status: 500 }
    );
  }
}
