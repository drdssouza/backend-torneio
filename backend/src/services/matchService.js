import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const updateMatch = async (matchId, score1, score2) => {
  // 1. Buscar o match antigo (antes de atualizar)
  const oldMatch = await prisma.match.findUnique({
    where: { id: matchId }
  });

  // 2. Atualizar o placar
  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      score1,
      score2,
      status: 'finalizado'
    }
  });

  // 3. Se já estava finalizado, desfazer as estatísticas antigas
  if (oldMatch.status === 'finalizado') {
    const team1 = await prisma.team.findUnique({ where: { id: match.team1Id } });
    const team2 = await prisma.team.findUnique({ where: { id: match.team2Id } });

    // Reverter estatísticas antigas
    await prisma.team.update({
      where: { id: team1.id },
      data: {
        wins: oldMatch.score1 > oldMatch.score2 ? team1.wins - 1 : team1.wins,
        gamesWon: team1.gamesWon - oldMatch.score1,
        gamesLost: team1.gamesLost - oldMatch.score2
      }
    });

    await prisma.team.update({
      where: { id: team2.id },
      data: {
        wins: oldMatch.score2 > oldMatch.score1 ? team2.wins - 1 : team2.wins,
        gamesWon: team2.gamesWon - oldMatch.score2,
        gamesLost: team2.gamesLost - oldMatch.score1
      }
    });
  }

  // 4. Aplicar novas estatísticas
  const team1 = await prisma.team.findUnique({ where: { id: match.team1Id } });
  const team2 = await prisma.team.findUnique({ where: { id: match.team2Id } });

  await prisma.team.update({
    where: { id: team1.id },
    data: {
      wins: score1 > score2 ? team1.wins + 1 : team1.wins,
      gamesWon: team1.gamesWon + score1,
      gamesLost: team1.gamesLost + score2
    }
  });

  await prisma.team.update({
    where: { id: team2.id },
    data: {
      wins: score2 > score1 ? team2.wins + 1 : team2.wins,
      gamesWon: team2.gamesWon + score2,
      gamesLost: team2.gamesLost + score1
    }
  });

  return match;
};

export const getMatches = async (category, gender, tournamentId) => {
  return await prisma.match.findMany({
    where: { category, gender, tournamentId },
    include: {
      team1: { include: { club: true } },
      team2: { include: { club: true } },
      group: true
    },
    orderBy: { id: 'asc' }
  });
};