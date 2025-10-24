import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
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

async function executeSeedComplete() {
  console.log('🌱 [SEED] Iniciando seed completo...');

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD não configurado');
  }

  // Limpar dados anteriores
  console.log('[SEED] Limpando banco...');
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  await prisma.club.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.admin.deleteMany();

  // Criar admin
  console.log('[SEED] Criando admin...');
  const senhaHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.admin.create({
    data: {
      username: 'admin_torneio',
      password: senhaHash
    }
  });

  // Criar torneio com clubes
  console.log('[SEED] Criando torneio...');
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
    include: { clubs: true }
  });

  console.log('[SEED] Criando duplas...');
  const categorias = ['E', 'D', 'C'];
  const generos = ['MASCULINO', 'FEMININO'];
  let totalDuplas = 0;

  for (const categoria of categorias) {
    for (const genero of generos) {
      const nomes = genero === 'MASCULINO' ? nomesMasculinos : nomesFemininos;
      
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
          
          totalDuplas++;
        }
      }
    }
  }

  console.log('[SEED] ✓ Seed concluído!');

  return {
    admin: { username: admin.username },
    tournament: { id: tournament.id, name: tournament.name },
    clubs: tournament.clubs.length,
    duplas: totalDuplas
  };
}

async function executePopulateResults() {
  console.log('🎲 [POPULATE] Iniciando população de resultados...');

  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true }
  });

  if (!tournament) {
    throw new Error('Nenhum torneio ativo encontrado');
  }

  const categorias = ['E', 'D', 'C'];
  const generos = ['MASCULINO', 'FEMININO'];
  const results = [];

  for (const categoria of categorias) {
    for (const genero of generos) {
      // Verificar se os grupos existem
      const groups = await prisma.group.findMany({
        where: { category: categoria, gender: genero, tournamentId: tournament.id }
      });

      if (groups.length === 0) {
        console.log(`[POPULATE] Pulando ${categoria} ${genero} - grupos não gerados`);
        continue;
      }

      console.log(`[POPULATE] Processando ${categoria} ${genero}...`);

      // Popular resultados dos jogos de grupos
      const matches = await prisma.match.findMany({
        where: {
          category: categoria,
          gender: genero,
          tournamentId: tournament.id,
          phase: 'grupos',
          status: 'pendente'
        },
        include: { team1: true, team2: true }
      });

      for (const match of matches) {
        const score1 = Math.random() > 0.5 ? 6 : Math.floor(Math.random() * 3) + 4;
        const score2 = score1 === 6 ? Math.floor(Math.random() * 5) : 6;
        
        await prisma.match.update({
          where: { id: match.id },
          data: { score1, score2, status: 'finalizado' }
        });

        const winnerId = score1 > score2 ? match.team1Id : match.team2Id;
        const loserId = score1 > score2 ? match.team2Id : match.team1Id;

        await prisma.team.update({
          where: { id: winnerId },
          data: {
            wins: { increment: 1 },
            gamesWon: { increment: score1 > score2 ? score1 : score2 },
            gamesLost: { increment: score1 > score2 ? score2 : score1 }
          }
        });

        await prisma.team.update({
          where: { id: loserId },
          data: {
            gamesWon: { increment: score1 > score2 ? score2 : score1 },
            gamesLost: { increment: score1 > score2 ? score1 : score2 }
          }
        });
      }

      // Gerar e popular eliminatórias
      const groupsWithTeams = await prisma.group.findMany({
        where: { category: categoria, gender: genero, tournamentId: tournament.id },
        include: {
          teams: { orderBy: [{ wins: 'desc' }, { gamesWon: 'desc' }] }
        },
        orderBy: { name: 'asc' }
      });

      if (groupsWithTeams.length !== 4) continue;

      const groupMap = {};
      groupsWithTeams.forEach(g => { groupMap[g.name] = g.teams; });

      if (!groupMap['A']?.[0] || !groupMap['B']?.[0] || !groupMap['C']?.[0] || !groupMap['D']?.[0]) {
        continue;
      }

      // Criar e popular quartas
      const quartasIds = [
        [groupMap['A'][0].id, groupMap['D'][1].id],
        [groupMap['B'][0].id, groupMap['C'][1].id],
        [groupMap['C'][0].id, groupMap['B'][1].id],
        [groupMap['D'][0].id, groupMap['A'][1].id]
      ];

      const vencedoresQuartas = [];
      for (const [team1Id, team2Id] of quartasIds) {
        const score1 = Math.random() > 0.5 ? 6 : Math.floor(Math.random() * 3) + 4;
        const score2 = score1 === 6 ? Math.floor(Math.random() * 5) : 6;
        
        const quarta = await prisma.match.create({
          data: {
            team1Id, team2Id, score1, score2,
            category: categoria, gender: genero, tournamentId: tournament.id,
            phase: 'quartas', status: 'finalizado'
          }
        });
        
        vencedoresQuartas.push(score1 > score2 ? team1Id : team2Id);
      }

      // Criar e popular semis
      const s1Score1 = Math.random() > 0.5 ? 6 : Math.floor(Math.random() * 3) + 4;
      const s1Score2 = s1Score1 === 6 ? Math.floor(Math.random() * 5) : 6;
      
      const semi1 = await prisma.match.create({
        data: {
          team1Id: vencedoresQuartas[0], team2Id: vencedoresQuartas[1],
          score1: s1Score1, score2: s1Score2,
          category: categoria, gender: genero, tournamentId: tournament.id,
          phase: 'semi', status: 'finalizado'
        }
      });

      const s2Score1 = Math.random() > 0.5 ? 6 : Math.floor(Math.random() * 3) + 4;
      const s2Score2 = s2Score1 === 6 ? Math.floor(Math.random() * 5) : 6;
      
      const semi2 = await prisma.match.create({
        data: {
          team1Id: vencedoresQuartas[2], team2Id: vencedoresQuartas[3],
          score1: s2Score1, score2: s2Score2,
          category: categoria, gender: genero, tournamentId: tournament.id,
          phase: 'semi', status: 'finalizado'
        }
      });

      const finalistaSemi1 = s1Score1 > s1Score2 ? semi1.team1Id : semi1.team2Id;
      const finalistaSemi2 = s2Score1 > s2Score2 ? semi2.team1Id : semi2.team2Id;

      // Criar e popular final
      const fScore1 = Math.random() > 0.5 ? 6 : Math.floor(Math.random() * 3) + 4;
      const fScore2 = fScore1 === 6 ? Math.floor(Math.random() * 5) : 6;
      
      const final = await prisma.match.create({
        data: {
          team1Id: finalistaSemi1, team2Id: finalistaSemi2,
          score1: fScore1, score2: fScore2,
          category: categoria, gender: genero, tournamentId: tournament.id,
          phase: 'final', status: 'finalizado'
        }
      });

      const campeaoId = fScore1 > fScore2 ? final.team1Id : final.team2Id;
      const campeao = await prisma.team.findUnique({
        where: { id: campeaoId },
        include: { club: true }
      });

      results.push({
        category: categoria,
        gender: genero,
        campeao: `${campeao.player1}/${campeao.player2} (${campeao.club.name})`
      });
    }
  }

  console.log('[POPULATE] ✓ População concluída!');
  return results;
}

// ========== ROTAS GET (Acessar direto pela URL) ==========

router.get('/seed-complete', async (req, res) => {
  try {
    const data = await executeSeedComplete();
    
    res.json({
      success: true,
      message: 'Seed executado com sucesso!',
      data
    });
  } catch (error) {
    console.error('[SEED] ❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/populate-results', async (req, res) => {
  try {
    const results = await executePopulateResults();
    
    res.json({
      success: true,
      message: 'Resultados populados com sucesso!',
      results
    });
  } catch (error) {
    console.error('[POPULATE] ❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ROTAS POST (Para uso via fetch/API) ==========

router.post('/seed-complete', async (req, res) => {
  try {
    const data = await executeSeedComplete();
    
    res.json({
      success: true,
      message: 'Seed executado com sucesso!',
      data
    });
  } catch (error) {
    console.error('[SEED] ❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/populate-results', async (req, res) => {
  try {
    const results = await executePopulateResults();
    
    res.json({
      success: true,
      message: 'Resultados populados com sucesso!',
      results
    });
  } catch (error) {
    console.error('[POPULATE] ❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;