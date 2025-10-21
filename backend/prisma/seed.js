import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  await prisma.club.deleteMany();
  await prisma.admin.deleteMany();

  // Criar admin com senha hasheada
  const hashedPassword = await bcrypt.hash('60t=yU83', 10);
  
  await prisma.admin.create({
    data: {
      username: 'admin_torneio',
      password: hashedPassword
    }
  });

  // Criar torneio inicial
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Torneio Interclubes 2025',
      isActive: true,
      clubs: {
        create: [
          { name: 'Arena B2' },
          { name: 'Rilex Beach Tennis' },
          { name: 'Beach do Lago' },
          { name: 'Arena Beach MN' }
        ]
      }
    },
    include: {
      clubs: true
    }
  });

  console.log('✅ Seed concluído!');
  console.log('✅ Admin criado: admin_torneio');
  console.log('✅ Torneio criado:', tournament.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });