import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("seriesId");

    if (!seriesId) {
      return NextResponse.json(
        { error: "seriesId es requerido" },
        { status: 400 }
      );
    }

    const volumes = await prisma.volume.findMany({
      where: { seriesId },
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
    });

    return NextResponse.json({ volumes });
  } catch (error) {
    console.error("Error fetching volumes:", error);
    return NextResponse.json(
      { error: "Error al obtener volúmenes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para crear volúmenes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { seriesId, number, title } = body;

    if (!seriesId || !number) {
      return NextResponse.json(
        { error: "seriesId y number son requeridos" },
        { status: 400 }
      );
    }

    const series = await prisma.series.findUnique({
      where: { id: seriesId },
    });

    if (!series) {
      return NextResponse.json(
        { error: "Serie no encontrada" },
        { status: 404 }
      );
    }

    if (series.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para crear volúmenes en esta serie" },
        { status: 403 }
      );
    }

    const existingVolume = await prisma.volume.findUnique({
      where: {
        seriesId_number: {
          seriesId,
          number,
        },
      },
    });

    if (existingVolume) {
      return NextResponse.json(
        { error: "Ya existe un volumen con ese número" },
        { status: 400 }
      );
    }

    const volume = await prisma.volume.create({
      data: {
        seriesId,
        number,
        title,
      },
    });

    return NextResponse.json({ volume }, { status: 201 });
  } catch (error) {
    console.error("Error creating volume:", error);
    return NextResponse.json(
      { error: "Error al crear volumen" },
      { status: 500 }
    );
  }
}
