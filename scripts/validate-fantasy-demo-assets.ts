import fs from "node:fs/promises";
import path from "node:path";

import AdmZip from "adm-zip";
import dotenv from "dotenv";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

interface FileCheck {
  file: string;
  bytes: number;
  width: number | null;
  height: number | null;
  mime: string | null;
  passed: boolean;
}

dotenv.config({ path: ".env.local" });

async function main(): Promise<void> {
  const root = process.cwd();
  const assetDir = path.join(root, "public", "qa", "fantasy-demo", "chapter-1");
  const zipPath = path.join(root, "tests", "fixtures", "qa-fantasy-demo", "chapter-1.zip");
  const reportPath = path.join(
    root,
    "docs",
    "qa",
    "fantasy-demo-content",
    "generated",
    "asset-validation.json",
  );

  const maxImageSize = Number(process.env.MAX_IMAGE_SIZE || "10485760");
  const maxZipSize = Number(process.env.MAX_ZIP_SIZE || "52428800");
  const maxPages = Number(process.env.MAX_PAGES_PER_CHAPTER || "100");

  const entries = (await fs.readdir(assetDir)).filter((name) => name.endsWith(".png"));
  const checks: FileCheck[] = [];

  for (const entry of entries) {
    const buffer = await fs.readFile(path.join(assetDir, entry));
    const type = await fileTypeFromBuffer(buffer);
    const metadata = await sharp(buffer).metadata();
    const passed =
      buffer.byteLength <= maxImageSize &&
      !!type &&
      ["image/png", "image/jpeg", "image/webp"].includes(type.mime) &&
      (metadata.width || 0) >= 200 &&
      (metadata.height || 0) >= 200;

    checks.push({
      file: entry,
      bytes: buffer.byteLength,
      width: metadata.width || null,
      height: metadata.height || null,
      mime: type?.mime || null,
      passed,
    });
  }

  const zipBuffer = await fs.readFile(zipPath);
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip
    .getEntries()
    .filter((entry) => !entry.isDirectory)
    .map((entry) => entry.entryName);

  const report = {
    assetDir,
    zipPath,
    expectedPageCount: entries.length,
    results: {
      pageCountWithinLimit: entries.length <= maxPages,
      zipWithinLimit: zipBuffer.byteLength <= maxZipSize,
      numericOrderingStable:
        JSON.stringify([...entries].sort()) === JSON.stringify([...zipEntries].sort()),
      files: checks,
    },
    summary: {
      passedFiles: checks.filter((check) => check.passed).length,
      totalFiles: checks.length,
      zipBytes: zipBuffer.byteLength,
    },
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
