import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configurado para aceitar o frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ status: 'Backend rodando!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});