import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Hash da senha
  const senhaHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

  // Criar usuário admin
  const admin = await prisma.usuario.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@torneio.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: process.env.ADMIN_EMAIL || 'admin@torneio.com',
      senha: senhaHash,
      tipo: 'ORGANIZADOR'
    }
  });

  console.log('✅ Usuário admin criado:', {
    id: admin.id,
    nome: admin.nome,
    email: admin.email
  });

  console.log('\n📝 Use estas credenciais para login:');
  console.log(`Email: ${admin.email}`);
  console.log(`Senha: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });