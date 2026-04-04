import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  extractImagesFromZip,
  validateZipSize,
  processAndUploadImage,
} from "@/lib/upload";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para subir contenido" },
        { status: 403 }
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id },
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Solo se aceptan archivos ZIP" },
        { status: 400 }
      );
    }

    const zipBuffer = Buffer.from(await file.arrayBuffer());
    validateZipSize(zipBuffer);

    const images = await extractImagesFromZip(zipBuffer);

    const uploadedUrls: string[] = [];
    const pages: Array<{
      chapterId: string;
      number: number;
      imageUrl: string;
      width: number;
      height: number;
    }> = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const filename = `chapter-${id}/page-${String(i + 1).padStart(3, "0")}`;

        const processed = await processAndUploadImage(image.data, filename);
        uploadedUrls.push(processed.url);

        pages.push({
          chapterId: id,
          number: i + 1,
          imageUrl: processed.url,
          width: processed.width,
          height: processed.height,
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.page.deleteMany({
          where: { chapterId: id },
        });

        await tx.page.createMany({
          data: pages,
        });

        await tx.chapter.update({
          where: { id },
          data: {
            pageCount: pages.length,
          },
        });

        const existingModeration = await tx.moderation.findFirst({
          where: { chapterId: id },
        });

        if (!existingModeration) {
          await tx.moderation.create({
            data: {
              chapterId: id,
              status: "PENDING",
            },
          });
        } else if (existingModeration.status === "REJECTED") {
          await tx.moderation.update({
            where: { id: existingModeration.id },
            data: {
              status: "PENDING",
              reviewedAt: null,
              reviewerId: null,
              notes: null,
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        pageCount: pages.length,
      });
    } catch (error) {
      logger.error("Error uploading images, cleaning up:", error);
      for (const url of uploadedUrls) {
        try {
          const { del } = await import("@vercel/blob");
          await del(url);
        } catch (cleanupError) {
          logger.error("Error cleaning up blob:", cleanupError);
        }
      }
      throw error;
    }
  } catch (error) {
    logger.error("Error uploading chapter:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al subir capítulo",
      },
      { status: 500 }
    );
  }
}
