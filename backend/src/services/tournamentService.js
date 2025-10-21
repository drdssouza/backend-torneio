import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getActiveTournament = async () => {
  return await prisma.tournament.findFirst({
    where: { isActive: true },
    include: {
      clubs: true
    }
  });
};

export const getAllTournaments = async () => {
  return await prisma.tournament.findMany({
    orderBy: { date: 'desc' },
    include: {
      _count: {
        select: { teams: true, matches: true }
      }
    }
  });
};

export const createTournament = async (name) => {
  await prisma.tournament.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  const tournament = await prisma.tournament.create({
    data: {
      name,
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

  return tournament;
};

export const setActiveTournament = async (tournamentId) => {
  await prisma.tournament.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  return await prisma.tournament.update({
    where: { id: tournamentId },
    data: { isActive: true }
  });
};

export const deleteTournament = async (tournamentId) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });

  if (tournament.isActive) {
    throw new Error('Não é possível excluir o torneio ativo');
  }

  return await prisma.tournament.delete({
    where: { id: tournamentId }
  });
};