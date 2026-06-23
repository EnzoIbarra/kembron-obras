import bcrypt from 'bcrypt';
import { prisma } from '@/shared/lib/prisma';
import type { UsuarioDto } from '../types';

export async function listUsuarios(): Promise<UsuarioDto[]> {
  const users = await prisma.usuario.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      assignments: {
        include: { obra: { select: { name: true } } },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role as 'ADMIN' | 'SUPERVISOR',
    createdAt: u.createdAt.toISOString(),
    assignments: u.assignments.map((a) => ({
      obraId: a.obraId,
      obraName: a.obra.name,
    })),
  }));
}

export async function createUsuario(data: {
  username: string;
  password: string;
  role: 'ADMIN' | 'SUPERVISOR';
}): Promise<void> {
  const hashed = await bcrypt.hash(data.password, 10);
  await prisma.usuario.create({
    data: { username: data.username, password: hashed, role: data.role },
  });
}

export async function updateUsuario(
  id: string,
  data: { username?: string; role?: string; password?: string },
): Promise<void> {
  const update: Record<string, string> = {};
  if (data.username) update.username = data.username;
  if (data.role) update.role = data.role;
  if (data.password && data.password.length > 0) {
    update.password = await bcrypt.hash(data.password, 10);
  }
  await prisma.usuario.update({ where: { id }, data: update });
}

export async function deleteUsuario(id: string, requesterId: string): Promise<void> {
  if (id === requesterId) throw new Error('No podés eliminarte a vos mismo');
  await prisma.usuario.delete({ where: { id } });
}

export async function replaceAsignaciones(
  userId: string,
  obraIds: string[],
): Promise<void> {
  await prisma.$transaction([
    prisma.asignacionObraSupervisor.deleteMany({ where: { userId } }),
    prisma.asignacionObraSupervisor.createMany({
      data: obraIds.map((obraId) => ({ userId, obraId })),
    }),
  ]);
}
