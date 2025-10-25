import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const POINTS = {
  grupos: 2,      // Não passou da fase de grupos
  quartas: 4,     // Não passou das quartas
  semi: 8,        // Não passou da semi
  finalista: 10,  // Perdeu a final
  campeao: 15     // Ganhou a final
};

export const calculatePoints = async (tournamentId) => {
  // Resetar pontos
  await prisma.team.updateMany({
    where: { tournamentId },
    data: { points: 0, placement: null }
  });

  const categories = ['E', 'D', 'C'];
  const genders = ['MASCULINO', 'FEMININO'];

  for (const category of categories) {
    for (const gender of genders) {
      await calculateCategoryPoints(tournamentId, category, gender);
    }
  }

  return await getArenaRanking(tournamentId);
};

async function calculateCategoryPoints(tournamentId, category, gender) {
  // 1. Buscar grupos e classificados
  const groups = await prisma.group.findMany({
    where: { tournamentId, category, gender },
    include: {
      teams: {
        orderBy: [
          { wins: 'desc' },
          { gamesWon: 'desc' }
        ]
      }
    }
  });

  // Marcar quem não passou da fase de grupos (3º e 4º de cada grupo)
  for (const group of groups) {
    for (let i = 2; i < group.teams.length; i++) {
      await prisma.team.update({
        where: { id: group.teams[i].id },
        data: { points: POINTS.grupos, placement: 'grupos' }
      });
    }
  }

  // 2. Buscar eliminatórias
  const quartas = await prisma.match.findMany({
    where: { tournamentId, category, gender, phase: 'quartas', status: 'finalizado' }
  });

  // Perdedores das quartas
  for (const match of quartas) {
    const loserId = match.score1 > match.score2 ? match.team2Id : match.team1Id;
    await prisma.team.update({
      where: { id: loserId },
      data: { points: POINTS.quartas, placement: 'quartas' }
    });
  }

  // 3. Semifinais
  const semis = await prisma.match.findMany({
    where: { tournamentId, category, gender, phase: 'semi', status: 'finalizado' }
  });

  // Perdedores das semis
  for (const match of semis) {
    const loserId = match.score1 > match.score2 ? match.team2Id : match.team1Id;
    await prisma.team.update({
      where: { id: loserId },
      data: { points: POINTS.semi, placement: 'semi' }
    });
  }

  // 4. Final
  const final = await prisma.match.findFirst({
    where: { tournamentId, category, gender, phase: 'final', status: 'finalizado' }
  });

  if (final) {
    const winnerId = final.score1 > final.score2 ? final.team1Id : final.team2Id;
    const loserId = final.score1 > final.score2 ? final.team2Id : final.team1Id;

    await prisma.team.update({
      where: { id: winnerId },
      data: { points: POINTS.campeao, placement: 'campeao' }
    });

    await prisma.team.update({
      where: { id: loserId },
      data: { points: POINTS.finalista, placement: 'finalista' }
    });
  }
}

export const getArenaRanking = async (tournamentId) => {
  const teams = await prisma.team.findMany({
    where: { tournamentId },
    include: { club: true }
  });

  // Agrupar por arena
  const arenaPoints = {};

  teams.forEach(team => {
    if (!arenaPoints[team.club.name]) {
      arenaPoints[team.club.name] = {
        clubName: team.club.name,
        totalPoints: 0,
        categories: {
          E: { MASCULINO: [], FEMININO: [] },
          D: { MASCULINO: [], FEMININO: [] },
          C: { MASCULINO: [], FEMININO: [] }
        }
      };
    }

    arenaPoints[team.club.name].totalPoints += team.points;
    arenaPoints[team.club.name].categories[team.category][team.gender].push({
      player1: team.player1,
      player2: team.player2,
      points: team.points,
      placement: team.placement
    });
  });

  // Converter para array e ordenar
  return Object.values(arenaPoints).sort((a, b) => b.totalPoints - a.totalPoints);
};

export const getDetailedRanking = async (tournamentId, clubName) => {
  const teams = await prisma.team.findMany({
    where: { 
      tournamentId,
      club: { name: clubName }
    },
    include: { club: true },
    orderBy: [
      { category: 'asc' },
      { gender: 'asc' },
      { points: 'desc' }
    ]
  });

  return teams;
};