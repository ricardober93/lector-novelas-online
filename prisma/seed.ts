import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
});

async function seedUsers(tx: any) {
  const usersData = [
    { email: 'reader@test.com', name: 'Reader User', role: Role.READER },
    { email: 'creator@test.com', name: 'Creator User', role: Role.CREATOR },
    { email: 'admin@test.com', name: 'Admin User', role: Role.ADMIN },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await tx.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        emailVerified: new Date(),
      },
    });
    users.push(user);
  }

  return users;
}

async function seedSeries(tx: any, creatorId: string) {
  const seriesData = [
    { title: 'Naruto Shippuden', type: 'MANGA' as const, status: 'ACTIVE' as const, isAdult: false },
    { title: 'One Piece', type: 'MANGA' as const, status: 'ACTIVE' as const, isAdult: false },
    { title: 'Attack on Titan', type: 'MANGA' as const, status: 'ACTIVE' as const, isAdult: false },
    { title: 'Demon Slayer', type: 'MANGA' as const, status: 'ACTIVE' as const, isAdult: false },
    { title: 'Spider-Man', type: 'COMIC' as const, status: 'ACTIVE' as const, isAdult: false },
    { title: 'Batman: Year One', type: 'COMIC' as const, status: 'DRAFT' as const, isAdult: false },
    { title: 'Solo Leveling', type: 'MANHUA' as const, status: 'ACTIVE' as const, isAdult: false },
    { title: 'Tower of God', type: 'MANHUA' as const, status: 'ACTIVE' as const, isAdult: false },
    { title: 'Doki Doki Literature Club', type: 'VISUAL_NOVEL' as const, status: 'DRAFT' as const, isAdult: false },
    { title: 'Webtoon Original', type: 'OTHER' as const, status: 'DRAFT' as const, isAdult: false },
  ];

  const series = [];
  for (const s of seriesData) {
    const created = await tx.series.create({
      data: {
        ...s,
        creatorId,
        description: `Descripción de prueba para ${s.title}`,
        coverImage: `https://via.placeholder.com/400x600/1a1a1a/ffffff?text=${encodeURIComponent(s.title)}`,
      },
    });
    series.push(created);
  }

  return series;
}

async function seedVolumes(tx: any, series: any[]) {
  const volumes = [];
  for (const s of series) {
    for (let i = 1; i <= 2; i++) {
      const volume = await tx.volume.create({
        data: {
          seriesId: s.id,
          number: i,
          title: `Volumen ${i} de ${s.title}`,
        },
      });
      volumes.push(volume);
    }
  }

  return volumes;
}

async function seedChapters(tx: any, volumes: any[]) {
  const allChapters = [];
  for (const volume of volumes) {
    for (let i = 1; i <= 5; i++) {
      const status = Math.random() > 0.4 ? 'APPROVED' : 'PENDING';
      allChapters.push({
        volumeId: volume.id,
        number: i,
        title: `Capítulo ${i}`,
        status,
        pageCount: 15,
      });
    }
  }

  await tx.chapter.createMany({ data: allChapters });
  
  return await tx.chapter.findMany();
}

async function seedPages(tx: any, chapters: any[]) {
  const allPages = [];
  for (const chapter of chapters) {
    for (let i = 1; i <= 15; i++) {
      allPages.push({
        chapterId: chapter.id,
        number: i,
        imageUrl: `https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+${i}`,
        width: 800,
        height: 1200,
      });
    }
  }

  await tx.page.createMany({ data: allPages });
  
  return allPages.length;
}

async function seedModerations(tx: any, chapters: any[]) {
  const pendingChapters = chapters.filter(c => c.status === 'PENDING');
  await tx.moderation.createMany({
    data: pendingChapters.map(chapter => ({
      chapterId: chapter.id,
      status: 'PENDING',
    })),
  });

  return pendingChapters.length;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot run seed in production environment');
    console.error('Current NODE_ENV:', process.env.NODE_ENV);
    process.exit(1);
  }

  const startTime = Date.now();
  console.log('🌱 Starting seed...');

  await prisma.$transaction(async (tx) => {
    console.log('Creating users...');
    const users = await seedUsers(tx);
    console.log(`✅ Created ${users.length} users`);

    const creator = users.find(u => u.email === 'creator@test.com');
    if (!creator) {
      throw new Error('Creator user not found');
    }

    console.log('Creating series...');
    const series = await seedSeries(tx, creator.id);
    console.log(`✅ Created ${series.length} series`);

    console.log('Creating volumes...');
    const volumes = await seedVolumes(tx, series);
    console.log(`✅ Created ${volumes.length} volumes`);

    console.log('Creating chapters...');
    const chapters = await seedChapters(tx, volumes);
    console.log(`✅ Created ${chapters.length} chapters`);

    console.log('Creating pages...');
    const totalPages = await seedPages(tx, chapters);
    console.log(`✅ Created ${totalPages} pages`);

    console.log('Creating moderation records...');
    const moderations = await seedModerations(tx, chapters);
    console.log(`✅ Created ${moderations} moderation records`);
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🎉 Seed completed successfully in ${duration}s!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
