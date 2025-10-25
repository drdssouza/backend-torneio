import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Gerar placar aleatório entre 4 e 6
function gerarPlacar() {
  const score1 = Math.random() > 0.5 ? 6 : Math.floor(Math.random() * 3) + 4;
  const score2 = score1 === 6 ? Math.floor(Math.random() * 5) : 6;
  return { score1, score2 };
}

async function popularResultados(category, gender, tournamentId) {
  console.log(`\n🎾 Populando resultados - ${category} ${gender}...`);

  // 1. Buscar todos os jogos da fase de grupos
  const matches = await prisma.match.findMany({
    where: {
      category,
      gender,
      tournamentId,
      phase: 'grupos',
      status: 'pendente'
    },
    include: {
      team1: true,
      team2: true
    }
  });

  console.log(`   📝 ${matches.length} jogos de grupos encontrados`);

  // 2. Popular resultados dos jogos de grupos
  for (const match of matches) {
    const { score1, score2 } = gerarPlacar();
    
    await prisma.match.update({
      where: { id: match.id },
      data: { score1, score2, status: 'finalizado' }
    });

    // Atualizar estatísticas dos times
    const winnerId = score1 > score2 ? match.team1Id : match.team2Id;
    const loserId = score1 > score2 ? match.team2Id : match.team1Id;

    // Atualizar vencedor
    await prisma.team.update({
      where: { id: winnerId },
      data: {
        wins: { increment: 1 },
        gamesWon: { increment: score1 > score2 ? score1 : score2 },
        gamesLost: { increment: score1 > score2 ? score2 : score1 }
      }
    });

    // Atualizar perdedor
    await prisma.team.update({
      where: { id: loserId },
      data: {
        gamesWon: { increment: score1 > score2 ? score2 : score1 },
        gamesLost: { increment: score1 > score2 ? score1 : score2 }
      }
    });
  }

  console.log(`   ✓ Resultados de grupos populados`);

  // 3. Gerar eliminatórias
  console.log(`   🏁 Gerando eliminatórias...`);
  
  const groups = await prisma.group.findMany({
    where: { category, gender, tournamentId },
    include: {
      teams: {
        orderBy: [
          { wins: 'desc' },
          { gamesWon: 'desc' }
        ]
      }
    },
    orderBy: { name: 'asc' }
  });

  if (groups.length !== 4) {
    console.log(`   ⚠️  Grupos insuficientes para eliminatórias`);
    return;
  }

  const groupMap = {};
  groups.forEach(g => { groupMap[g.name] = g.teams; });

  // Verificar classificados
  if (!groupMap['A']?.[0] || !groupMap['B']?.[0] || !groupMap['C']?.[0] || !groupMap['D']?.[0]) {
    console.log(`   ⚠️  Classificados insuficientes`);
    return;
  }

  const first_A = groupMap['A'][0];
  const second_A = groupMap['A'][1];
  const first_B = groupMap['B'][0];
  const second_B = groupMap['B'][1];
  const first_C = groupMap['C'][0];
  const second_C = groupMap['C'][1];
  const first_D = groupMap['D'][0];
  const second_D = groupMap['D'][1];

  // Criar quartas de final
  const quartas = [];
  
  quartas.push(await prisma.match.create({
    data: {
      team1Id: first_A.id,
      team2Id: second_D.id,
      category, gender, tournamentId,
      phase: 'quartas'
    }
  }));

  quartas.push(await prisma.match.create({
    data: {
      team1Id: first_B.id,
      team2Id: second_C.id,
      category, gender, tournamentId,
      phase: 'quartas'
    }
  }));

  quartas.push(await prisma.match.create({
    data: {
      team1Id: first_C.id,
      team2Id: second_B.id,
      category, gender, tournamentId,
      phase: 'quartas'
    }
  }));

  quartas.push(await prisma.match.create({
    data: {
      team1Id: first_D.id,
      team2Id: second_A.id,
      category, gender, tournamentId,
      phase: 'quartas'
    }
  }));

  console.log(`   ✓ 4 quartas de final criadas`);

  // Popular resultados das quartas
  const vencedoresQuartas = [];
  for (const quarta of quartas) {
    const { score1, score2 } = gerarPlacar();
    await prisma.match.update({
      where: { id: quarta.id },
      data: { score1, score2, status: 'finalizado' }
    });
    vencedoresQuartas.push(score1 > score2 ? quarta.team1Id : quarta.team2Id);
  }

  console.log(`   ✓ Resultados das quartas populados`);

  // Criar semifinais
  const semi1 = await prisma.match.create({
    data: {
      team1Id: vencedoresQuartas[0],
      team2Id: vencedoresQuartas[1],
      category, gender, tournamentId,
      phase: 'semi'
    }
  });

  const semi2 = await prisma.match.create({
    data: {
      team1Id: vencedoresQuartas[2],
      team2Id: vencedoresQuartas[3],
      category, gender, tournamentId,
      phase: 'semi'
    }
  });

  console.log(`   ✓ 2 semifinais criadas`);

  // Popular resultados das semis
  const { score1: s1Score1, score2: s1Score2 } = gerarPlacar();
  await prisma.match.update({
    where: { id: semi1.id },
    data: { score1: s1Score1, score2: s1Score2, status: 'finalizado' }
  });

  const { score1: s2Score1, score2: s2Score2 } = gerarPlacar();
  await prisma.match.update({
    where: { id: semi2.id },
    data: { score1: s2Score1, score2: s2Score2, status: 'finalizado' }
  });

  const finalistaSemi1 = s1Score1 > s1Score2 ? semi1.team1Id : semi1.team2Id;
  const finalistaSemi2 = s2Score1 > s2Score2 ? semi2.team1Id : semi2.team2Id;

  console.log(`   ✓ Resultados das semis populados`);

  // Criar final
  const final = await prisma.match.create({
    data: {
      team1Id: finalistaSemi1,
      team2Id: finalistaSemi2,
      category, gender, tournamentId,
      phase: 'final'
    }
  });

  // Popular resultado da final
  const { score1: fScore1, score2: fScore2 } = gerarPlacar();
  await prisma.match.update({
    where: { id: final.id },
    data: { score1: fScore1, score2: fScore2, status: 'finalizado' }
  });

  const campeaoId = fScore1 > fScore2 ? final.team1Id : final.team2Id;
  const campeao = await prisma.team.findUnique({
    where: { id: campeaoId },
    include: { club: true }
  });

  console.log(`   ✓ Final criada e resultado populado`);
  console.log(`   🏆 CAMPEÃO: ${campeao.player1}/${campeao.player2} (${campeao.club.name})`);
}

async function main() {
  console.log('🎲 Populando resultados automáticos...\n');

  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true }
  });

  if (!tournament) {
    console.error('❌ Nenhum torneio ativo encontrado!');
    process.exit(1);
  }

  console.log(`📍 Torneio ativo: ${tournament.name}\n`);

  const categorias = ['E', 'D', 'C'];
  const generos = ['MASCULINO', 'FEMININO'];

  for (const categoria of categorias) {
    for (const genero of generos) {
      // Verificar se os grupos já foram gerados
      const groups = await prisma.group.findMany({
        where: {
          category: categoria,
          gender: genero,
          tournamentId: tournament.id
        }
      });

      if (groups.length === 0) {
        console.log(`⚠️  Categoria ${categoria} ${genero}: Grupos não gerados ainda. Pulando...`);
        continue;
      }

      await popularResultados(categoria, genero, tournament.id);
    }
  }

  // Calcular ranking final
  console.log('\n🏅 Calculando ranking das arenas...');
  
  const POINTS = {
    grupos: 2,
    quartas: 4,
    semi: 8,
    finalista: 10,
    campeao: 15
  };

  // Resetar pontos
  await prisma.team.updateMany({
    data: { points: 0, placement: null }
  });

  // Atribuir pontos baseado na colocação
  for (const categoria of categorias) {
    for (const genero of generos) {
      // Grupos (3º e 4º lugar)
      const groups = await prisma.group.findMany({
        where: { 
          category: categoria, 
          gender: genero, 
          tournamentId: tournament.id 
        },
        include: {
          teams: {
            orderBy: [{ wins: 'desc' }, { gamesWon: 'desc' }]
          }
        }
      });

      for (const group of groups) {
        for (let i = 2; i < group.teams.length; i++) {
          await prisma.team.update({
            where: { id: group.teams[i].id },
            data: { points: POINTS.grupos, placement: 'grupos' }
          });
        }
      }

      // Quartas
      const quartas = await prisma.match.findMany({
        where: { 
          category: categoria, 
          gender: genero, 
          tournamentId: tournament.id, 
          phase: 'quartas', 
          status: 'finalizado' 
        }
      });

      for (const match of quartas) {
        const loserId = match.score1 > match.score2 ? match.team2Id : match.team1Id;
        await prisma.team.update({
          where: { id: loserId },
          data: { points: POINTS.quartas, placement: 'quartas' }
        });
      }

      // Semis
      const semis = await prisma.match.findMany({
        where: { 
          category: categoria, 
          gender: genero, 
          tournamentId: tournament.id, 
          phase: 'semi', 
          status: 'finalizado' 
        }
      });

      for (const match of semis) {
        const loserId = match.score1 > match.score2 ? match.team2Id : match.team1Id;
        await prisma.team.update({
          where: { id: loserId },
          data: { points: POINTS.semi, placement: 'semi' }
        });
      }

      // Final
      const final = await prisma.match.findFirst({
        where: { 
          category: categoria, 
          gender: genero, 
          tournamentId: tournament.id, 
          phase: 'final', 
          status: 'finalizado' 
        }
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
  }

  console.log('✓ Ranking calculado\n');

  // Mostrar ranking final
  const teams = await prisma.team.findMany({
    where: { tournamentId: tournament.id },
    include: { club: true }
  });

  const arenaPoints = {};
  teams.forEach(team => {
    if (!arenaPoints[team.club.name]) {
      arenaPoints[team.club.name] = 0;
    }
    arenaPoints[team.club.name] += team.points;
  });

  console.log('🏆 RANKING FINAL DAS ARENAS:\n');
  const ranking = Object.entries(arenaPoints)
    .sort(([,a], [,b]) => b - a)
    .map(([arena, pontos], index) => {
      const medals = ['🥇', '🥈', '🥉', '4️⃣'];
      return `   ${medals[index] || '  '} ${arena}: ${pontos} pontos`;
    });

  console.log(ranking.join('\n'));

  console.log('\n✨ Tudo pronto! Acesse o sistema e veja os resultados completos!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });