import { ContentType, ModerationStatus, Prisma, SeriesStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const creatorId = searchParams.get("creatorId");
    const q = searchParams.get("q")?.trim();
    const showAdult = searchParams.get("showAdult") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const conditions: Prisma.SeriesWhereInput[] = [];

    if (creatorId) {
      conditions.push({ creatorId });
    }

    if (status) {
      conditions.push({ status: status as SeriesStatus });
    } else if (!creatorId) {
      conditions.push({ status: SeriesStatus.ACTIVE });
    }

    if (type) {
      conditions.push({ type: type as ContentType });
    }

    if (q) {
      conditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (!creatorId && !showAdult) {
      conditions.push({ isAdult: false });
    }

    const series = await prisma.series.findMany({
      where: conditions.length > 0 ? { AND: conditions } : undefined,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
        volumes: {
          include: {
            chapters: {
              where: {
                status: "APPROVED",
              },
              select: {
                id: true,
              },
            },
          },
        },
        _count: {
          select: {
            volumes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const seriesWithChapterCount = series.map((s) => ({
      ...s,
      _count: {
        ...s._count,
        chapters: s.volumes.reduce((acc, vol) => acc + vol.chapters.length, 0),
      },
    }));

    return NextResponse.json({ series: seriesWithChapterCount });
  } catch (error) {
    logger.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Error al obtener series" },
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

    if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para crear series" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : null;
    const type = body?.type as ContentType | undefined;
    const isAdult = Boolean(body?.isAdult);

    if (!title) {
      return NextResponse.json(
        { error: "El título es requerido" },
        { status: 400 }
      );
    }

    if (!type || !Object.values(ContentType).includes(type)) {
      return NextResponse.json(
        { error: "El tipo de contenido no es válido" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const series = await tx.series.create({
        data: {
          creatorId: session.user.id,
          title,
          description,
          type,
          isAdult,
          status: SeriesStatus.DRAFT,
        },
      });

      await tx.moderation.create({
        data: {
          seriesId: series.id,
          status: ModerationStatus.PENDING,
        },
      });

      return series;
    });

    return NextResponse.json({ series: result }, { status: 201 });
  } catch (error) {
    logger.error("Error creating series:", error);
    return NextResponse.json(
      { error: "Error al crear serie" },
      { status: 500 }
    );
  }
}
