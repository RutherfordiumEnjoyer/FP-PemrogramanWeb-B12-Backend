import { PrismaClient } from '@prisma/client';

export const seedAirplaneGame = async (prisma: PrismaClient) => {
  console.log('✈️ Seeding (Force Update) Airplane General Game...');

  // 1. Cari Template Airplane
  const airplaneTemplate = await prisma.gameTemplates.findUnique({
    where: { slug: 'airplane' },
  });

  if (!airplaneTemplate) {
    console.error('❌ Template Airplane tidak ditemukan.');
    return;
  }

  // 2. Cari User Super Admin
  const superAdmin = await prisma.users.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!superAdmin) {
    console.error('❌ User Super Admin tidak ditemukan.');
    return;
  }

  // 3. JSON Soal (Pastikan strukturnya benar: { questions: [...] })
  const generalQuestions = {
    questions: [
      {
        question: "Ibu kota negara Indonesia adalah...",
        correctAnswer: "Jakarta",
        wrongAnswers: ["Bandung", "Surabaya", "Medan", "Bali"]
      },
      {
        question: "Hewan pemakan daging disebut...",
        correctAnswer: "Karnivora",
        wrongAnswers: ["Herbivora", "Omnivora", "Insectivora", "Frugivora"]
      },
      {
        question: "Warna bendera Indonesia adalah...",
        correctAnswer: "Merah Putih",
        wrongAnswers: ["Putih Merah", "Merah Biru", "Hijau Kuning", "Hitam Putih"]
      },
      {
        question: "Bahasa pemrograman web dasar adalah...",
        correctAnswer: "HTML",
        wrongAnswers: ["Python", "C++", "Java", "Swift"]
      },
      {
        question: "2 + 2 x 2 = ...",
        correctAnswer: "6",
        wrongAnswers: ["8", "4", "10", "12"]
      }
    ],
    gameSettings: {
      speed: "normal"
    }
  };

  // 4. UPSERT (Update jika ada, Create jika belum ada)
  // Kita kunci berdasarkan 'name' karena di schema field name @unique
  await prisma.games.upsert({
    where: { name: 'Airplane: General Knowledge' },
    update: {
      game_json: generalQuestions,          // <-- INI YANG PENTING (Timpa data lama)
      description: 'Uji wawasan umummu sambil terbang!',
      thumbnail_image: 'default_image.jpg',
      is_published: true,
      game_template_id: airplaneTemplate.id,
      // creator_id tidak perlu diupdate kalau sudah ada
    },
    create: {
      name: 'Airplane: General Knowledge',
      description: 'Uji wawasan umummu sambil terbang!',
      thumbnail_image: 'default_image.jpg',
      game_template_id: airplaneTemplate.id,
      creator_id: superAdmin.id,
      is_published: true,
      game_json: generalQuestions,
      total_played: 0,
    },
  });

  console.log('✅ Airplane General Game Updated Successfully!');
};