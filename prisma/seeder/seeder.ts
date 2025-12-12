import { PrismaClient } from '@prisma/client';

import { gameTemplateSeed, quizSeed, userSeed } from './seed';
import { seedAirplaneGame } from './seed/airplane.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('⚒️ Seeding for WordIT backend database...');

  try {
    await userSeed(process.env.NODE_ENV === 'production');
    await gameTemplateSeed();
    await quizSeed();
  } catch (error) {
    console.error('⛔ Seeding error:', error);
    process.exit(1);
  } finally {
    console.log('✅ Seeding success');
    await seedAirplaneGame(prisma);
    await prisma.$disconnect();
  }
}

main();
