import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId es requerido" },
        { status: 400 }
      );
    }

    const currentChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        volume: {
          select: {
            id: true,
            number: true,
            seriesId: true,
          },
        },
      },
    });

    if (!currentChapter) {
      return NextResponse.json(
        { error: "Capítulo no encontrado" },
        { status: 404 }
      );
    }

    const previous = await prisma.chapter.findFirst({
      where: {
        volume: { seriesId: currentChapter.volume.seriesId },
        status: "APPROVED",
        OR: [
          {
            volumeId: currentChapter.volumeId,
            number: { lt: currentChapter.number },
          },
          {
            volume: { number: { lt: currentChapter.volume.number } },
          },
        ],
      },
      orderBy: [
        { volume: { number: "desc" } },
        { number: "desc" },
      ],
      select: {
        id: true,
        number: true,
        title: true,
      },
    });

    const next = await prisma.chapter.findFirst({
      where: {
        volume: { seriesId: currentChapter.volume.seriesId },
        status: "APPROVED",
        OR: [
          {
            volumeId: currentChapter.volumeId,
            number: { gt: currentChapter.number },
          },
          {
            volume: { number: { gt: currentChapter.volume.number } },
          },
        ],
      },
      orderBy: [
        { volume: { number: "asc" } },
        { number: "asc" },
      ],
      select: {
        id: true,
        number: true,
        title: true,
      },
    });

    return NextResponse.json({ previous, next });
  } catch (error) {
    logger.error("Error fetching navigation:", error);
    return NextResponse.json(
      { error: "Error al obtener navegación" },
      { status: 500 }
    );
  }
}
