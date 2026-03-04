import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { chapterId, pageOrder } = body as {
      chapterId: string;
      pageOrder: string[];
    };

    if (!chapterId || !pageOrder || !Array.isArray(pageOrder)) {
      return NextResponse.json(
        { error: "chapterId y pageOrder son requeridos" },
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
                creatorId: true,
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

    if (
      chapter.volume.series.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para reordenar este capítulo" },
        { status: 403 }
      );
    }

    await prisma.$transaction(
      pageOrder.map((pageId, index) =>
        prisma.page.update({
          where: { id: pageId },
          data: { number: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error reordering pages:", error);
    return NextResponse.json(
      { error: "Error al reordenar páginas" },
      { status: 500 }
    );
  }
}
