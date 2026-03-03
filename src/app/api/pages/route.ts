import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processAndUploadImage } from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para subir contenido" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const chapterId = formData.get("chapterId") as string;
    const number = parseInt(formData.get("number") as string);

    if (!file || !chapterId || !number) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
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
        { error: "No tienes permisos para subir a este capítulo" },
        { status: 403 }
      );
    }

    const filename = `chapter-${chapterId}/page-${String(number).padStart(3, "0")}`;
    const processed = await processAndUploadImage(file, filename);

    const page = await prisma.page.create({
      data: {
        chapterId,
        number,
        imageUrl: processed.url,
        width: processed.width,
        height: processed.height,
      },
    });

    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        pageCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Error uploading page:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al subir página",
      },
      { status: 500 }
    );
  }
}
