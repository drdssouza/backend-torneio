import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createTeam = async (player1, player2, clubId, category, gender, tournamentId) => {
  return await prisma.team.create({
    data: {
      player1,
      player2,
      clubId: parseInt(clubId),
      category,
      gender,
      tournamentId: parseInt(tournamentId)
    },
    include: {
      club: true
    }
  });
};

export const getTeams = async (category, gender, tournamentId) => {
  return await prisma.team.findMany({
    where: { 
      category, 
      gender, 
      tournamentId: parseInt(tournamentId) 
    },
    include: { club: true }
  });
};

export const deleteTeam = async (id) => {
  return await prisma.team.delete({
    where: { id: parseInt(id) }
  });
};

export const updateTeam = async (id, player1, player2, clubId) => {
  return await prisma.team.update({
    where: { id: parseInt(id) },
    data: { 
      player1, 
      player2, 
      clubId: parseInt(clubId) 
    },
    include: { club: true }
  });
};