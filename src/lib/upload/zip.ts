import AdmZip from "adm-zip";
import { isValidImageExtension } from "./validate";

export interface ExtractedImage {
  filename: string;
  data: Buffer;
}

export async function extractImagesFromZip(
  zipBuffer: Buffer
): Promise<ExtractedImage[]> {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  const images: ExtractedImage[] = [];

  zipEntries.forEach((entry) => {
    if (!entry.isDirectory && isValidImageExtension(entry.entryName)) {
      images.push({
        filename: entry.entryName,
        data: entry.getData(),
      });
    }
  });

  if (images.length === 0) {
    throw new Error("El archivo ZIP no contiene imágenes válidas");
  }

  const maxPages = parseInt(process.env.MAX_PAGES_PER_CHAPTER || "100");
  if (images.length > maxPages) {
    throw new Error(`Demasiadas imágenes (máximo ${maxPages})`);
  }

  images.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

  return images;
}

export function validateZipSize(zipBuffer: Buffer): void {
  const maxSize = parseInt(process.env.MAX_ZIP_SIZE || "52428800");
  if (zipBuffer.byteLength > maxSize) {
    throw new Error(`El archivo ZIP excede el tamaño máximo de 50MB`);
  }
}
