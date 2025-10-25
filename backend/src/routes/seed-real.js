import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// Dados reais do torneio
const TORNEIO_DATA = {
  'E': {
    'MASCULINO': {
      'A': [
        { player1: 'Alisson', player2: 'Gabriel', club: 'Arena B2' },
        { player1: 'Faitao', player2: 'Ytalo', club: 'Arena Beach MN' },
        { player1: 'Marcos', player2: 'Rafael', club: 'Beach do Lago' },
        { player1: 'João', player2: 'Gean', club: 'Rilex Beach Tennis' }
      ],
      'B': [
        { player1: 'Junior', player2: 'José', club: 'Arena B2' },
        { player1: 'João', player2: 'Gabriel', club: 'Arena Beach MN' },
        { player1: 'Bruno', player2: 'Lucas Lago', club: 'Beach do Lago' },
        { player1: 'Roger', player2: 'Reinaldo', club: 'Rilex Beach Tennis' }
      ],
      'C': [
        { player1: 'Gabriel', player2: 'Caio', club: 'Arena B2' },
        { player1: 'Léo', player2: 'Gabriel', club: 'Arena Beach MN' },
        { player1: 'Denis', player2: 'Wendel', club: 'Beach do Lago' },
        { player1: 'Hugo', player2: 'Gabriel', club: 'Rilex Beach Tennis' }
      ],
      'D': [
        { player1: 'Matheus', player2: 'Gabriel', club: 'Arena B2' },
        { player1: 'Tubarão', player2: 'Esnalto', club: 'Arena Beach MN' },
        { player1: 'Edgar', player2: 'Eduardo', club: 'Beach do Lago' },
        { player1: 'Luan', player2: 'Jeferson', club: 'Rilex Beach Tennis' }
      ]
    },
    'FEMININO': {
      'A': [
        { player1: 'Georgia', player2: 'Amanda', club: 'Beach do Lago' },
        { player1: 'Ana', player2: 'Isa F', club: 'Arena Beach MN' },
        { player1: 'Juliana', player2: 'Danubia', club: 'Rilex Beach Tennis' },
        { player1: 'Ariadne', player2: 'Maria', club: 'Arena B2' }
      ],
      'B': [
        { player1: 'Erica', player2: 'Mayara', club: 'Beach do Lago' },
        { player1: 'Michele', player2: 'Joh', club: 'Arena Beach MN' },
        { player1: 'Bruna', player2: 'Valentina', club: 'Rilex Beach Tennis' },
        { player1: 'Tais', player2: 'Beatriz', club: 'Arena B2' }
      ],
      'C': [
        { player1: 'Tais', player2: 'Cler', club: 'Beach do Lago' },
        { player1: 'Tainara', player2: 'Canelo', club: 'Arena Beach MN' },
        { player1: 'Ana', player2: 'Helen', club: 'Rilex Beach Tennis' },
        { player1: 'Vanessa', player2: 'Leticia', club: 'Arena B2' }
      ],
      'D': [
        { player1: 'Leticia', player2: 'Lara', club: 'Beach do Lago' },
        { player1: 'Isa', player2: 'Bianca', club: 'Arena Beach MN' },
        { player1: 'Giovana', player2: 'Giordara', club: 'Rilex Beach Tennis' },
        { player1: 'Luana', player2: 'Bela', club: 'Arena B2' }
      ]
    }
  },
  'D': {
    'MASCULINO': {
      'A': [
        { player1: 'Vini', player2: 'Bidu', club: 'Rilex Beach Tennis' },
        { player1: 'Edgar', player2: 'Lucas R', club: 'Beach do Lago' },
        { player1: 'Alisson', player2: 'Adriel', club: 'Arena Beach MN' },
        { player1: 'Gustavo S', player2: 'Matheus', club: 'Arena B2' }
      ],
      'B': [
        { player1: 'Fabiano', player2: 'Renan', club: 'Rilex Beach Tennis' },
        { player1: 'Bruno', player2: 'Renan', club: 'Beach do Lago' },
        { player1: 'Fer', player2: 'Du', club: 'Arena Beach MN' },
        { player1: 'Alisson', player2: 'Henrique', club: 'Arena B2' }
      ],
      'C': [
        { player1: 'Renildo', player2: 'Valber', club: 'Rilex Beach Tennis' },
        { player1: 'Renato', player2: 'Xundi', club: 'Beach do Lago' },
        { player1: 'Danilo', player2: 'Mika', club: 'Arena Beach MN' },
        { player1: 'Dudu', player2: 'Gabriel', club: 'Arena B2' }
      ],
      'D': [
        { player1: 'Fagner', player2: 'Neri', club: 'Rilex Beach Tennis' },
        { player1: 'Manso', player2: 'Gustavo', club: 'Arena Beach MN' },
        { player1: 'Gabriel', player2: 'Alef', club: 'Arena B2' },
        { player1: 'Denis', player2: 'Wendel', club: 'Beach do Lago' }
      ]
    },
    'FEMININO': {
      'A': [
        { player1: 'Georgia', player2: 'Ana', club: 'Beach do Lago' },
        { player1: 'Akiko', player2: 'Erika', club: 'Arena Beach MN' },
        { player1: 'Cris', player2: 'Neia', club: 'Rilex Beach Tennis' },
        { player1: 'Raquel', player2: 'Kethlen', club: 'Arena B2' }
      ],
      'B': [
        { player1: 'Fran', player2: 'Fer', club: 'Beach do Lago' },
        { player1: 'Duda', player2: 'Luiza', club: 'Arena Beach MN' },
        { player1: 'Taina', player2: 'Paloma', club: 'Rilex Beach Tennis' },
        { player1: 'Bruna', player2: 'Carol', club: 'Arena B2' }
      ],
      'C': [
        { player1: 'Erika', player2: 'Susan', club: 'Beach do Lago' },
        { player1: 'Manu', player2: 'Isa', club: 'Arena Beach MN' },
        { player1: 'Erika', player2: 'Marcela', club: 'Rilex Beach Tennis' },
        { player1: 'Anna H', player2: 'Lauana', club: 'Arena B2' }
      ],
      'D': [
        { player1: 'Debora', player2: 'Gra', club: 'Beach do Lago' },
        { player1: 'Ana', player2: 'Bianca', club: 'Arena Beach MN' },
        { player1: 'Mayara', player2: 'Mariana', club: 'Rilex Beach Tennis' },
        { player1: 'Ana', player2: 'Malu', club: 'Arena B2' }
      ]
    }
  },
  'C': {
    'MASCULINO': {
      'A': [
        { player1: 'Lucas', player2: 'Max', club: 'Arena B2' },
        { player1: 'Lincon', player2: 'Valber', club: 'Rilex Beach Tennis' },
        { player1: 'Lavarda', player2: 'Mika', club: 'Arena Beach MN' },
        { player1: 'Renan', player2: 'Andre', club: 'Beach do Lago' }
      ],
      'B': [
        { player1: 'Asaf', player2: 'Eduardo', club: 'Arena B2' },
        { player1: 'Joni', player2: 'Zanuto', club: 'Rilex Beach Tennis' },
        { player1: 'Andre', player2: 'Alisson', club: 'Arena Beach MN' },
        { player1: 'Pedro', player2: 'João', club: 'Beach do Lago' }
      ],
      'C': [
        { player1: 'Lucas', player2: 'Heitor', club: 'Arena B2' },
        { player1: 'Andre', player2: 'Gordinho', club: 'Rilex Beach Tennis' },
        { player1: 'Rafa', player2: 'Rapha', club: 'Arena Beach MN' },
        { player1: 'Gustavo', player2: 'Vini', club: 'Beach do Lago' }
      ],
      'D': [
        { player1: 'Dudu', player2: 'Gabriel', club: 'Arena B2' },
        { player1: 'Samuel', player2: 'Tatão', club: 'Rilex Beach Tennis' },
        { player1: 'Bença', player2: 'Fernando', club: 'Arena Beach MN' },
        { player1: 'Renato', player2: 'Xundi', club: 'Beach do Lago' }
      ]
    },
    'FEMININO': {
      'A': [
        { player1: 'Carol', player2: 'Alessandra', club: 'Beach do Lago' },
        { player1: 'Isa', player2: 'Amanda', club: 'Arena Beach MN' },
        { player1: 'Leticia', player2: 'Lorrane', club: 'Rilex Beach Tennis' },
        { player1: 'Tati', player2: 'Lorena', club: 'Arena B2' }
      ],
      'B': [
        { player1: 'Mari', player2: 'Rafa', club: 'Beach do Lago' },
        { player1: 'Lais', player2: 'Leticia', club: 'Arena Beach MN' },
        { player1: 'Jenifer', player2: 'Kity', club: 'Rilex Beach Tennis' },
        { player1: 'Lana', player2: 'Giovana', club: 'Arena B2' }
      ],
      'C': [
        { player1: 'Duda', player2: 'Luiza', club: 'Beach do Lago' },
        { player1: 'Aline', player2: 'Andrea', club: 'Arena Beach MN' },
        { player1: 'Bianca', player2: 'Cris', club: 'Rilex Beach Tennis' },
        { player1: 'Jenifer', player2: 'Nubia', club: 'Arena B2' }
      ],
      'D': [
        { player1: 'Carol', player2: 'Alessandra', club: 'Beach do Lago' },
        { player1: 'Gi', player2: 'Akiko', club: 'Arena Beach MN' },
        { player1: 'Bianca', player2: 'Cris', club: 'Rilex Beach Tennis' },
        { player1: 'Bia', player2: 'Alana', club: 'Arena B2' }
      ]
    }
  }
};

async function executeSeedReal() {
  console.log('🌱 [SEED REAL] Iniciando seed com dados reais do torneio...');

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD não configurado');
  }

  // Limpar dados anteriores
  console.log('[SEED REAL] Limpando banco...');
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  await prisma.club.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.admin.deleteMany();

  // Criar admin
  console.log('[SEED REAL] Criando admin...');
  const senhaHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.admin.create({
    data: {
      username: 'admin_torneio',
      password: senhaHash
    }
  });

  // Criar torneio com clubes
  console.log('[SEED REAL] Criando torneio...');
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

  console.log('[SEED REAL] Criando grupos e duplas...');

  // Criar grupos e duplas para cada categoria
  for (const [categoria, generos] of Object.entries(TORNEIO_DATA)) {
    for (const [genero, grupos] of Object.entries(generos)) {
      console.log(`  → ${categoria} ${genero}`);

      // Criar os 4 grupos
      for (const [grupoNome, duplas] of Object.entries(grupos)) {
        const grupo = await prisma.group.create({
          data: {
            name: grupoNome,
            category: categoria,
            gender: genero,
            tournamentId: tournament.id
          }
        });

        // Criar as duplas do grupo
        for (const dupla of duplas) {
          const club = tournament.clubs.find(c => c.name === dupla.club);
          
          if (!club) {
            console.warn(`    ⚠️ Clube não encontrado: ${dupla.club}`);
            continue;
          }

          const team = await prisma.team.create({
            data: {
              player1: dupla.player1,
              player2: dupla.player2,
              clubId: club.id,
              category: categoria,
              gender: genero,
              tournamentId: tournament.id,
              groupId: grupo.id
            }
          });
        }

        // Criar jogos do grupo (todos contra todos)
        const teamsInGroup = await prisma.team.findMany({
          where: { groupId: grupo.id }
        });

        for (let i = 0; i < teamsInGroup.length; i++) {
          for (let j = i + 1; j < teamsInGroup.length; j++) {
            await prisma.match.create({
              data: {
                groupId: grupo.id,
                team1Id: teamsInGroup[i].id,
                team2Id: teamsInGroup[j].id,
                category: categoria,
                gender: genero,
                tournamentId: tournament.id,
                phase: 'grupos'
              }
            });
          }
        }
      }
    }
  }

  console.log('[SEED REAL] ✓ Seed concluído com dados reais!');

  // Contar totais
  const totalTeams = await prisma.team.count();
  const totalGroups = await prisma.group.count();
  const totalMatches = await prisma.match.count();

  return {
    admin: { username: admin.username },
    tournament: { id: tournament.id, name: tournament.name },
    clubs: tournament.clubs.length,
    groups: totalGroups,
    teams: totalTeams,
    matches: totalMatches
  };
}

// Rota GET
router.get('/seed-real', async (req, res) => {
  try {
    const data = await executeSeedReal();
    
    res.json({
      success: true,
      message: 'Seed com dados reais executado com sucesso!',
      data
    });
  } catch (error) {
    console.error('[SEED REAL] ❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota POST
router.post('/seed-real', async (req, res) => {
  try {
    const data = await executeSeedReal();
    
    res.json({
      success: true,
      message: 'Seed com dados reais executado com sucesso!',
      data
    });
  } catch (error) {
    console.error('[SEED REAL] ❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;