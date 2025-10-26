import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const POINTS = {
  grupos: 2,      // Participou da fase de grupos
  quartas: 4,     // Eliminado nas quartas
  semi: 8,        // Eliminado na semi
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
  // 1. Verificar se há jogos de grupos finalizados
  const finishedGroupMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      category,
      gender,
      phase: 'grupos',
      status: 'finalizado'
    }
  });

  // Se não há jogos finalizados, ninguém ganha pontos ainda
  if (finishedGroupMatches.length === 0) {
    console.log(`[RANKING] ${category} ${gender}: Nenhum jogo finalizado ainda`);
    return;
  }

  // 2. Buscar grupos e classificados
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

  // 3. Dar 2 pontos BASE para TODOS que jogaram na fase de grupos
  // (isso garante que quem participou já ganha pontos)
  for (const group of groups) {
    for (const team of group.teams) {
      await prisma.team.update({
        where: { id: team.id },
        data: { points: POINTS.grupos, placement: 'grupos' }
      });
    }
  }

  // 4. Buscar eliminatórias
  const quartas = await prisma.match.findMany({
    where: { tournamentId, category, gender, phase: 'quartas', status: 'finalizado' }
  });

  // Se não há quartas finalizadas, parar aqui (todos ficam com 2 pts)
  if (quartas.length === 0) {
    console.log(`[RANKING] ${category} ${gender}: Fase de grupos concluída (todos com 2 pts)`);
    return;
  }

  // 5. Atualizar perdedores das quartas para 4 pontos
  for (const match of quartas) {
    const loserId = match.score1 > match.score2 ? match.team2Id : match.team1Id;
    await prisma.team.update({
      where: { id: loserId },
      data: { points: POINTS.quartas, placement: 'quartas' }
    });
  }

  // 6. Semifinais
  const semis = await prisma.match.findMany({
    where: { tournamentId, category, gender, phase: 'semi', status: 'finalizado' }
  });

  if (semis.length === 0) {
    console.log(`[RANKING] ${category} ${gender}: Quartas concluídas`);
    return;
  }

  // 7. Atualizar perdedores das semis para 8 pontos
  for (const match of semis) {
    const loserId = match.score1 > match.score2 ? match.team2Id : match.team1Id;
    await prisma.team.update({
      where: { id: loserId },
      data: { points: POINTS.semi, placement: 'semi' }
    });
  }

  // 8. Final
  const final = await prisma.match.findFirst({
    where: { tournamentId, category, gender, phase: 'final', status: 'finalizado' }
  });

  if (!final) {
    console.log(`[RANKING] ${category} ${gender}: Semis concluídas`);
    return;
  }

  // 9. Atualizar finalista e campeão
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

  console.log(`[RANKING] ${category} ${gender}: Torneio completo!`);
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