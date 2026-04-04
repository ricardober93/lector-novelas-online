import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/upload";
import { logger } from "@/lib/logger";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        chapter: {
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
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Página no encontrada" },
        { status: 404 }
      );
    }

    if (
      page.chapter.volume.series.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta página" },
        { status: 403 }
      );
    }

    await deleteImage(page.imageUrl);

    await prisma.$transaction(async (tx) => {
      await tx.page.delete({
        where: { id },
      });

      await tx.chapter.update({
        where: { id: page.chapterId },
        data: {
          pageCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Error al eliminar página" },
      { status: 500 }
    );
  }
}
