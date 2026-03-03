import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

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
    const { status, notes } = body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status debe ser APPROVED o REJECTED" },
        { status: 400 }
      );
    }

    const moderation = await prisma.moderation.findUnique({
      where: { id },
    });

    if (!moderation) {
      return NextResponse.json(
        { error: "Moderación no encontrada" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedModeration = await tx.moderation.update({
        where: { id },
        data: {
          status,
          notes,
          reviewerId: session.user.id,
          reviewedAt: new Date(),
        },
      });

      if (status === "APPROVED") {
        if (moderation.chapterId) {
          await tx.chapter.update({
            where: { id: moderation.chapterId },
            data: { status: "APPROVED" },
          });
        }

        if (moderation.seriesId && !moderation.chapterId) {
          await tx.series.update({
            where: { id: moderation.seriesId },
            data: { status: "ACTIVE" },
          });
        }
      } else if (status === "REJECTED") {
        if (moderation.chapterId) {
          await tx.chapter.update({
            where: { id: moderation.chapterId },
            data: { status: "REJECTED" },
          });
        }
      }

      return updatedModeration;
    });

    return NextResponse.json({ moderation: result });
  } catch (error) {
    console.error("Error updating moderation:", error);
    return NextResponse.json(
      { error: "Error al actualizar moderación" },
      { status: 500 }
    );
  }
}
