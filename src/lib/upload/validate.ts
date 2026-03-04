import { fileTypeFromBuffer } from "file-type";
import { logger } from "@/lib/logger";

export async function validateImageFormat(
  buffer: Uint8Array
): Promise<boolean> {
  try {
    const type = await fileTypeFromBuffer(buffer);
    if (!type) return false;

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    return allowedMimeTypes.includes(type.mime);
  } catch (error) {
    logger.error("Error validating image format:", error);
    return false;
  }
}

export function isValidImageExtension(filename: string): boolean {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return allowedExtensions.includes(ext);
}
