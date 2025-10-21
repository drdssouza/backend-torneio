import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const generateGroups = async (category, gender, tournamentId) => {
  await prisma.match.deleteMany({ where: { category, gender, tournamentId, phase: 'grupos' } });
  await prisma.team.updateMany({ where: { category, gender, tournamentId }, data: { groupId: null, wins: 0, gamesWon: 0, gamesLost: 0 } });
  await prisma.group.deleteMany({ where: { category, gender, tournamentId } });

  const teams = await prisma.team.findMany({
    where: { category, gender, tournamentId },
    include: { club: true }
  });

  if (teams.length !== 16) {
    throw new Error(`É necessário ter exatamente 16 duplas cadastradas. Atualmente há ${teams.length} duplas.`);
  }

  const teamsByClub = {};
  teams.forEach(team => {
    if (!teamsByClub[team.clubId]) teamsByClub[team.clubId] = [];
    teamsByClub[team.clubId].push(team);
  });

  const groupNames = ['A', 'B', 'C', 'D'];
  const groups = [];

  for (const name of groupNames) {
    const group = await prisma.group.create({
      data: { name, category, gender, tournamentId }
    });
    groups.push(group);
  }

  const clubIds = Object.keys(teamsByClub).map(id => parseInt(id));
  
  for (let groupIndex = 0; groupIndex < 4; groupIndex++) {
    const shuffledClubIds = [...clubIds].sort(() => Math.random() - 0.5);
    
    for (const clubId of shuffledClubIds) {
      const availableTeams = teamsByClub[clubId].filter(t => !t.groupId);
      
      if (availableTeams.length > 0) {
        const team = availableTeams[0];
        await prisma.team.update({
          where: { id: team.id },
          data: { groupId: groups[groupIndex].id }
        });
        team.groupId = groups[groupIndex].id;
      }
    }
  }

  for (const group of groups) {
    const teamsInGroup = await prisma.team.findMany({
      where: { groupId: group.id }
    });

    for (let i = 0; i < teamsInGroup.length; i++) {
      for (let j = i + 1; j < teamsInGroup.length; j++) {
        await prisma.match.create({
          data: {
            groupId: group.id,
            team1Id: teamsInGroup[i].id,
            team2Id: teamsInGroup[j].id,
            category,
            gender,
            tournamentId,
            phase: 'grupos'
          }
        });
      }
    }
  }

  return await prisma.group.findMany({
    where: { category, gender, tournamentId },
    include: {
      teams: { include: { club: true } },
      matches: {
        include: {
          team1: { include: { club: true } },
          team2: { include: { club: true } }
        }
      }
    }
  });
};

export const getGroups = async (category, gender, tournamentId) => {
  return await prisma.group.findMany({
    where: { category, gender, tournamentId },
    include: {
      teams: {
        include: { club: true },
        orderBy: [
          { wins: 'desc' },
          { gamesWon: 'desc' }
        ]
      },
      matches: {
        include: {
          team1: { include: { club: true } },
          team2: { include: { club: true } }
        }
      }
    }
  });
};