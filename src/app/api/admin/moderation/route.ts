import { NextRequest, NextResponse } from "next/server";
import { ModerationStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const moderations = await prisma.moderation.findMany({
      where: {
        status: status as ModerationStatus,
      },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            type: true,
            isAdult: true,
            creator: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        chapter: {
          select: {
            id: true,
            number: true,
            title: true,
            pageCount: true,
            volume: {
              select: {
                number: true,
                series: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ moderations });
  } catch (error) {
    logger.error("Error fetching moderations:", error);
    return NextResponse.json(
      { error: "Error al obtener moderaciones" },
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { seriesId, chapterId } = body;

    if (!seriesId && !chapterId) {
      return NextResponse.json(
        { error: "seriesId o chapterId son requeridos" },
        { status: 400 }
      );
    }

    const moderation = await prisma.moderation.create({
      data: {
        seriesId,
        chapterId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ moderation }, { status: 201 });
  } catch (error) {
    logger.error("Error creating moderation:", error);
    return NextResponse.json(
      { error: "Error al crear moderación" },
      { status: 500 }
    );
  }
}
