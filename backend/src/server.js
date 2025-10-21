import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ status: 'Backend rodando!' });
});

// ROTA DE DEBUG - TEMPORÁRIA
app.get('/debug/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true
      }
    });
    res.json({ 
      total: usuarios.length,
      usuarios 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      connected: false 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});