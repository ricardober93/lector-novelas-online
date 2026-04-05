import fs from "node:fs/promises";
import path from "node:path";

import AdmZip from "adm-zip";
import dotenv from "dotenv";
import sharp from "sharp";

interface PagePlan {
  number: number;
  title: string;
  beat: string;
  prompt: string;
  colors: {
    top: string;
    bottom: string;
    accent: string;
    glow: string;
  };
}

const width = 900;
const height = 1400;

dotenv.config({ path: ".env.local" });

const pages: PagePlan[] = [
  {
    number: 1,
    title: "Terraza del umbral",
    beat: "Ira observa la ciudad suspendida y la llama distante.",
    prompt:
      "Ira on a high terrace, distant beacon fading, moonlit suspended city.",
    colors: { top: "#0b1730", bottom: "#1f4f68", accent: "#f3b562", glow: "#fee29a" },
  },
  {
    number: 2,
    title: "La llama vacila",
    beat: "El fuego sagrado casi se apaga en un relicario antiguo.",
    prompt:
      "Weak sacred flame inside a copper relic bowl, intimate magical close-up.",
    colors: { top: "#120b1f", bottom: "#4e2d37", accent: "#ff9f68", glow: "#ffe0a8" },
  },
  {
    number: 3,
    title: "Archivo de piedra",
    beat: "Ira encuentra a Taro entre mapas imposibles.",
    prompt:
      "Archive chamber, impossible maps, Ira and Taro in urgent conversation.",
    colors: { top: "#102030", bottom: "#455a64", accent: "#d8b26e", glow: "#f7e1b5" },
  },
  {
    number: 4,
    title: "Nhal despierta",
    beat: "El zorro espectral revela el camino en un mapa dorado.",
    prompt:
      "Spectral fox tracing a golden route over an old map in a dark archive.",
    colors: { top: "#0a1420", bottom: "#20364a", accent: "#f4c95d", glow: "#fff3bf" },
  },
  {
    number: 5,
    title: "Puente de niebla",
    beat: "El grupo sale hacia el bosque suspendido.",
    prompt:
      "Three figures crossing a narrow bridge over a misty abyss under the moon.",
    colors: { top: "#12233d", bottom: "#42657a", accent: "#ffcd73", glow: "#fef0bf" },
  },
  {
    number: 6,
    title: "Escaleras rotas",
    beat: "Las ruinas inclinadas obligan a avanzar con cuidado.",
    prompt:
      "Broken stairs, collapsing ruins, moonlight cutting across sharp architecture.",
    colors: { top: "#141826", bottom: "#4b5563", accent: "#c08457", glow: "#f3d0a5" },
  },
  {
    number: 7,
    title: "Monolito rúnico",
    beat: "Las runas responden al tacto de Ira.",
    prompt:
      "Tall glowing monolith with amber runes reacting to Ira's presence.",
    colors: { top: "#0f172a", bottom: "#274c5e", accent: "#ffb347", glow: "#ffe8a3" },
  },
  {
    number: 8,
    title: "Cámara circular",
    beat: "El corazón del ritual aparece casi vacío.",
    prompt:
      "Circular ritual chamber with a nearly extinguished brazier at the center.",
    colors: { top: "#0d1117", bottom: "#2d3748", accent: "#ffad60", glow: "#f7d488" },
  },
  {
    number: 9,
    title: "El precio",
    beat: "Ira entiende el costo del ritual.",
    prompt:
      "Emotional close-up of Ira realizing the ritual requires a personal memory.",
    colors: { top: "#1a1022", bottom: "#4a2b43", accent: "#f59e0b", glow: "#ffefb0" },
  },
  {
    number: 10,
    title: "La discusión",
    beat: "Taro intenta detenerla en medio del viento mágico.",
    prompt:
      "Tense confrontation between Ira and Taro in a draft-filled ritual chamber.",
    colors: { top: "#151321", bottom: "#384860", accent: "#d97706", glow: "#ffd38a" },
  },
  {
    number: 11,
    title: "La decisión",
    beat: "Ira toca el brasero y Nhal la rodea.",
    prompt:
      "Ira kneeling at the brazier while the spectral fox spirals around her arm.",
    colors: { top: "#101827", bottom: "#264653", accent: "#f4a261", glow: "#ffe6b3" },
  },
  {
    number: 12,
    title: "Ritual del umbral",
    beat: "La cámara estalla en símbolos y luz ámbar.",
    prompt:
      "Controlled explosion of amber light, sigils, mist and ritual energy.",
    colors: { top: "#120c1d", bottom: "#6b3e26", accent: "#ff8c42", glow: "#fff0c2" },
  },
  {
    number: 13,
    title: "La ciudad despierta",
    beat: "La magia se propaga por torres y puentes.",
    prompt:
      "Wide city scene with rune lines and distant towers igniting with light.",
    colors: { top: "#0f1b33", bottom: "#2a6f97", accent: "#ffd166", glow: "#fff3b0" },
  },
  {
    number: 14,
    title: "Calma al amanecer",
    beat: "Los tres descansan junto al fuego restaurado.",
    prompt:
      "Quiet recovery scene at dawn beside the restored sacred flame.",
    colors: { top: "#26324f", bottom: "#e76f51", accent: "#f4d35e", glow: "#fff1c1" },
  },
  {
    number: 15,
    title: "Mapa vivo",
    beat: "Un nuevo mapa se dibuja solo bajo la mirada de Taro.",
    prompt:
      "Luminous map drawing itself on ancient stone tiles as Taro watches.",
    colors: { top: "#152238", bottom: "#355070", accent: "#e9c46a", glow: "#faf0ca" },
  },
  {
    number: 16,
    title: "Segundo portal",
    beat: "Un nuevo portal se enciende a lo lejos.",
    prompt:
      "Dawn exterior with Ira seeing a second portal flare in the distance.",
    colors: { top: "#1d3557", bottom: "#457b9d", accent: "#ffb703", glow: "#fff3bf" },
  },
];

function pad(number: number): string {
  return String(number).padStart(3, "0");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSvg(page: PagePlan): string {
  const pageNumber = pad(page.number);

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${page.colors.top}" />
        <stop offset="100%" stop-color="${page.colors.bottom}" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="30%" r="45%">
        <stop offset="0%" stop-color="${page.colors.glow}" stop-opacity="0.92" />
        <stop offset="100%" stop-color="${page.colors.glow}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="fog" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.14" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
      </linearGradient>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <circle cx="${width / 2}" cy="330" r="280" fill="url(#glow)" />
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#fog)" />

    <path d="M0 ${height - 180} C 180 ${height - 260}, 320 ${height - 220}, 520 ${height - 280} S 760 ${height - 160}, ${width} ${height - 220} L ${width} ${height} L 0 ${height} Z" fill="#05070e" fill-opacity="0.62"/>
    <path d="M0 ${height - 110} C 200 ${height - 160}, 360 ${height - 120}, 540 ${height - 180} S 760 ${height - 80}, ${width} ${height - 130} L ${width} ${height} L 0 ${height} Z" fill="#09111c" fill-opacity="0.88"/>

    <rect x="94" y="96" width="712" height="1208" rx="34" stroke="${page.colors.accent}" stroke-opacity="0.34" stroke-width="2"/>
    <rect x="118" y="116" width="664" height="72" rx="16" fill="#000000" fill-opacity="0.22"/>
    <rect x="118" y="1080" width="664" height="162" rx="24" fill="#000000" fill-opacity="0.28"/>

    <circle cx="742" cy="240" r="64" fill="${page.colors.accent}" fill-opacity="0.2"/>
    <circle cx="742" cy="240" r="28" fill="${page.colors.accent}" fill-opacity="0.9"/>
    <path d="M165 918 C 242 786, 332 684, 422 608 C 479 560, 535 516, 588 456" stroke="${page.colors.accent}" stroke-opacity="0.55" stroke-width="8" stroke-linecap="round"/>
    <path d="M205 958 C 292 866, 390 796, 502 702 C 570 646, 634 580, 692 500" stroke="${page.colors.glow}" stroke-opacity="0.38" stroke-width="4" stroke-linecap="round"/>

    <text x="142" y="156" fill="#F8FAFC" font-size="30" font-family="Georgia, Times New Roman, serif" letter-spacing="6">${pageNumber}</text>
    <text x="142" y="1138" fill="#FFFFFF" font-size="48" font-weight="700" font-family="Georgia, Times New Roman, serif">${escapeXml(page.title)}</text>
    <text x="142" y="1192" fill="#E2E8F0" font-size="24" font-family="Verdana, Arial, sans-serif">${escapeXml(page.beat)}</text>
    <text x="142" y="1236" fill="#CBD5E1" font-size="18" font-family="Verdana, Arial, sans-serif">${escapeXml(page.prompt)}</text>
    <text x="618" y="156" fill="#FDE68A" font-size="20" font-family="Verdana, Arial, sans-serif">QA INTERNAL</text>
  </svg>
  `.trim();
}

async function ensureCleanDir(directory: string): Promise<void> {
  await fs.rm(directory, { recursive: true, force: true });
  await fs.mkdir(directory, { recursive: true });
}

async function main(): Promise<void> {
  const root = process.cwd();
  const publicDir = path.join(root, "public", "qa", "fantasy-demo", "chapter-1");
  const fixtureDir = path.join(root, "tests", "fixtures", "qa-fantasy-demo");
  const invalidDir = path.join(fixtureDir, "invalid");
  const docsDir = path.join(root, "docs", "qa", "fantasy-demo-content", "generated");

  await ensureCleanDir(publicDir);
  await ensureCleanDir(fixtureDir);
  await fs.mkdir(invalidDir, { recursive: true });
  await fs.mkdir(docsDir, { recursive: true });

  const manifest: Array<{
    page: number;
    file: string;
    title: string;
    beat: string;
    prompt: string;
    sizeBytes: number;
  }> = [];

  const zip = new AdmZip();

  for (const page of pages) {
    const filename = `${pad(page.number)}.png`;
    const filepath = path.join(publicDir, filename);
    const svg = buildSvg(page);
    const png = await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toBuffer();

    await fs.writeFile(filepath, png);
    zip.addFile(filename, png);
    manifest.push({
      page: page.number,
      file: `public/qa/fantasy-demo/chapter-1/${filename}`,
      title: page.title,
      beat: page.beat,
      prompt: page.prompt,
      sizeBytes: png.byteLength,
    });
  }

  const invalidSmall = await sharp({
    create: {
      width: 160,
      height: 160,
      channels: 3,
      background: "#222222",
    },
  })
    .png()
    .toBuffer();

  await fs.writeFile(path.join(invalidDir, "too-small.png"), invalidSmall);
  await fs.writeFile(
    path.join(invalidDir, "wrong-format.txt"),
    "This file is intentionally invalid for upload validation.\n",
  );

  const zipPath = path.join(fixtureDir, "chapter-1.zip");
  zip.writeZip(zipPath);

  await fs.writeFile(
    path.join(docsDir, "manifest.json"),
    JSON.stringify(
      {
        chapter: "QA - La Llama del Umbral / Capitulo 1",
        totalPages: pages.length,
        width,
        height,
        files: manifest,
      },
      null,
      2,
    ),
  );

  console.log(`Generated ${pages.length} pages at ${publicDir}`);
  console.log(`ZIP package written to ${zipPath}`);
  console.log(`Invalid fixtures written to ${invalidDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
