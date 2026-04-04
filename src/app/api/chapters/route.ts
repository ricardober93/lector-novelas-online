import { NextRequest, NextResponse } from "next/server";
import { ChapterStatus, Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const volumeId = searchParams.get("volumeId");
    const status = searchParams.get("status");

    if (!volumeId) {
      return NextResponse.json(
        { error: "volumeId es requerido" },
        { status: 400 }
      );
    }

    const where: Prisma.ChapterWhereInput = { volumeId };

    if (status) {
      where.status = status as ChapterStatus;
    }

    const chapters = await prisma.chapter.findMany({
      where,
      include: {
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
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    logger.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Error al obtener capítulos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para crear capítulos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { volumeId, number, title } = body;

    if (!volumeId || !number) {
      return NextResponse.json(
        { error: "volumeId y number son requeridos" },
        { status: 400 }
      );
    }

    const volume = await prisma.volume.findUnique({
      where: { id: volumeId },
      include: {
        series: {
          select: {
            creatorId: true,
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

    if (
      volume.series.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para crear capítulos en este volumen" },
        { status: 403 }
      );
    }

    const existingChapter = await prisma.chapter.findUnique({
      where: {
        volumeId_number: {
          volumeId,
          number,
        },
      },
    });

    if (existingChapter) {
      return NextResponse.json(
        { error: "Ya existe un capítulo con ese número" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        volumeId,
        number,
        title,
        status: "PENDING",
      },
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    logger.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Error al crear capítulo" },
      { status: 500 }
    );
  }
}
