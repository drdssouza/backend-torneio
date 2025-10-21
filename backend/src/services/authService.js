import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

export const login = async (username, password) => {
  const admin = await prisma.admin.findUnique({
    where: { username }
  });

  if (!admin) {
    throw new Error('Credenciais inválidas');
  }

  // Verificar senha com hash
  const isValid = await bcrypt.compare(password, admin.password);

  if (!isValid) {
    throw new Error('Credenciais inválidas');
  }

  return { success: true, username: admin.username };
};