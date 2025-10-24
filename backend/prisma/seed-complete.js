import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Nomes fictícios para gerar duplas
const nomesMasculinos = [
  'Lucas', 'Pedro', 'Rafael', 'Felipe', 'Bruno', 'Thiago', 'Gabriel', 'Matheus',
  'André', 'Diego', 'Carlos', 'Fernando', 'Rodrigo', 'Marcelo', 'Ricardo', 'Paulo',
  'João', 'Vitor', 'Leonardo', 'Gustavo', 'Eduardo', 'Alexandre', 'Daniel', 'Igor',
  'Caio', 'Renato', 'Guilherme', 'Henrique', 'Leandro', 'Vinicius', 'Julio', 'Fábio'
];

const nomesFemininos = [
  'Ana', 'Maria', 'Julia', 'Beatriz', 'Carolina', 'Fernanda', 'Mariana', 'Camila',
  'Larissa', 'Gabriela', 'Amanda', 'Juliana', 'Patricia', 'Renata', 'Leticia', 'Natalia',
  'Bruna', 'Paula', 'Aline', 'Vanessa', 'Tatiana', 'Cristina', 'Sandra', 'Priscila',
  'Claudia', 'Luciana', 'Bianca', 'Rafaela', 'Isabela', 'Helena', 'Daniela', 'Adriana'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha', 'Almeida',
  'Nascimento', 'Barbosa', 'Araújo', 'Fernandes', 'Dias', 'Castro', 'Correia', 'Mendes'
];

function getNomeCompleto(nomes) {
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  return `${nome} ${sobrenome}`;
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

async function main() {
  console.log('🌱 Iniciando seed completo com dados de teste...\n');

  // Validar variáveis de ambiente
  const adminUsername = process.env.ADMIN_EMAIL || 'admin_torneio';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('❌ ERRO: Variável ADMIN_PASSWORD é obrigatória!');
    process.exit(1);
  }

  // Limpar dados anteriores
  console.log('🧹 Limpando banco de dados...');
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  await prisma.club.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.admin.deleteMany();

  // Criar usuário admin
  console.log('👤 Criando admin...');
  const senhaHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.admin.create({
    data: {
      username: adminUsername,
      password: senhaHash
    }
  });
  console.log(`✓ Admin criado: ${admin.username}\n`);

  // Criar torneio com clubes
  console.log('🏆 Criando torneio...');
  const tournament = await prisma.tournament.create({
    data: {
      name: '1ª Edição - Torneio Interclubes 2025',
      date: new Date('2025-01-15'),
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
  console.log(`✓ Torneio criado: ${tournament.name}`);
  console.log(`✓ Clubes: ${tournament.clubs.map(c => c.name).join(', ')}\n`);

  // Criar duplas para cada categoria e gênero
  const categorias = ['E', 'D', 'C'];
  const generos = ['MASCULINO', 'FEMININO'];

  for (const categoria of categorias) {
    for (const genero of generos) {
      console.log(`📋 Criando duplas - Categoria ${categoria} ${genero}...`);
      
      const nomes = genero === 'MASCULINO' ? nomesMasculinos : nomesFemininos;
      const nomesEmbaralhados = shuffleArray(nomes);
      
      let duplaIndex = 0;
      
      // Criar 4 duplas para cada clube (16 duplas no total)
      for (const club of tournament.clubs) {
        for (let i = 0; i < 4; i++) {
          const player1 = getNomeCompleto(nomes);
          const player2 = getNomeCompleto(nomes);
          
          await prisma.team.create({
            data: {
              player1,
              player2,
              clubId: club.id,
              category: categoria,
              gender: genero,
              tournamentId: tournament.id
            }
          });
          
          duplaIndex++;
        }
      }
      
      console.log(`  ✓ 16 duplas criadas (4 por clube)\n`);
    }
  }

  console.log('✨ Seed concluído com sucesso!\n');
  console.log('📊 Resumo:');
  console.log(`   • 1 torneio ativo`);
  console.log(`   • 4 clubes`);
  console.log(`   • 96 duplas (3 categorias × 2 gêneros × 16 duplas)`);
  console.log(`   • Admin: ${admin.username}`);
  console.log('\n💡 Agora você pode:');
  console.log('   1. Fazer login como admin');
  console.log('   2. Ir em "Gerenciar Duplas" em qualquer categoria');
  console.log('   3. Clicar em "Gerar Grupos Agora"');
  console.log('   4. Ver os grupos, registrar resultados e testar o sistema!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });