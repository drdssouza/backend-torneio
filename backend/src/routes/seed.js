import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/run-seed', async (req, res) => {
  try {
    console.log('🌱 Iniciando seed via API...');

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(400).json({ error: 'ADMIN_PASSWORD não configurado' });
    }

    const senhaHash = await bcrypt.hash(adminPassword, 10);

    // Limpar dados anteriores
    await prisma.match.deleteMany();
    await prisma.team.deleteMany();
    await prisma.group.deleteMany();
    await prisma.club.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.admin.deleteMany();

    // Criar admin
    const admin = await prisma.admin.create({
      data: {
        username: 'admin_torneio',
        password: senhaHash
      }
    });

    // Criar torneio com clubes
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Torneio Interclubes 2025',
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

    console.log('✅ Seed concluído!');

    res.json({
      success: true,
      message: 'Seed executado com sucesso!',
      admin: { id: admin.id, username: admin.username },
      tournament: { id: tournament.id, name: tournament.name },
      clubs: tournament.clubs.length
    });

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;