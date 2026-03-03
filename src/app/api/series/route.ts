import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = "ACTIVE";
    }

    if (type) {
      where.type = type;
    }

    const series = await prisma.series.findMany({
      where,
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
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Error al obtener series" },
      { status: 500 }
    );
  }
}
