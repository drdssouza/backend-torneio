import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Validar que as variáveis de ambiente existem
  const adminUsername = process.env.ADMIN_EMAIL || 'admin_torneio';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('❌ ERRO: Variável ADMIN_PASSWORD é obrigatória!');
    console.error('Configure-a no arquivo .env ou nas variáveis de ambiente do Railway.');
    process.exit(1);
  }

  // Hash da senha
  const senhaHash = await bcrypt.hash(adminPassword, 10);

  // Limpar dados anteriores
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  await prisma.club.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.admin.deleteMany();

  // Criar usuário admin
  const admin = await prisma.admin.create({
    data: {
      username: adminUsername,
      password: senhaHash
    }
  });

  console.log('✅ Admin criado:', {
    id: admin.id,
    username: admin.username
  });

  // Criar torneio inicial com clubes
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

  console.log('✅ Torneio criado:', tournament.name);
  console.log('✅ Clubes criados:', tournament.clubs.length);
  
  console.log('\n📝 Use estas credenciais para login:');
  console.log(`Username: ${admin.username}`);
  console.log(`Password: (a que você configurou no .env)`);
  console.log('\n✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
