import sharp from "sharp";
import { put, del } from "@vercel/blob";
import { validateImageFormat } from "./validate";
import { logger } from "@/lib/logger";

export interface ProcessedImage {
  url: string;
  width: number;
  height: number;
}

export async function processAndUploadImage(
  file: File | Buffer,
  filename: string
): Promise<ProcessedImage> {
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const uint8Array = new Uint8Array(buffer);

  const isValid = await validateImageFormat(uint8Array);
  if (!isValid) {
    throw new Error(`Formato de imagen no válido: ${filename}`);
  }

  const maxSize = parseInt(process.env.MAX_IMAGE_SIZE || "10485760");
  if (uint8Array.byteLength > maxSize) {
    throw new Error(`Imagen muy grande: ${filename} (máximo 10MB)`);
  }

  let image = sharp(uint8Array);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`No se pueden obtener dimensiones de: ${filename}`);
  }

  if (metadata.width < 200 || metadata.height < 200) {
    throw new Error(`Dimensiones mínimas 200x200px: ${filename}`);
  }

  const maxWidth = 1200;
  if (metadata.width > maxWidth) {
    image = image.resize(maxWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const outputBuffer = await image.webp({ quality: 80 }).toBuffer();

  const blobPath = `pages/${filename.replace(/\.[^/.]+$/, "")}.webp`;
  const blob = await put(blobPath, outputBuffer, {
    access: "public",
  });

  const newMetadata = await sharp(outputBuffer).metadata();

  return {
    url: blob.url,
    width: newMetadata.width || metadata.width,
    height: newMetadata.height || metadata.height,
  };
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    logger.error("Error deleting image:", error);
  }
}
