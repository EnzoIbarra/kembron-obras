import bcrypt from 'bcrypt';
import { PrismaClient, ObraStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Users ────────────────────────────────────────────────────────────────────
  // Passwords are hashed at seed time — no hardcoded hash strings.
  const [adminHash, sup1Hash, sup2Hash] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('Supervisor1!', 10),
    bcrypt.hash('Supervisor2!', 10),
  ]);

  const admin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    create: { username: 'admin', password: adminHash, role: Role.ADMIN },
    update: { password: adminHash },
  });

  const supervisor1 = await prisma.usuario.upsert({
    where: { username: 'supervisor1' },
    create: { username: 'supervisor1', password: sup1Hash, role: Role.SUPERVISOR },
    update: { password: sup1Hash },
  });

  const supervisor2 = await prisma.usuario.upsert({
    where: { username: 'supervisor2' },
    create: { username: 'supervisor2', password: sup2Hash, role: Role.SUPERVISOR },
    update: { password: sup2Hash },
  });

  console.log(`✓ Usuarios: ${admin.username}, ${supervisor1.username}, ${supervisor2.username}`);

  // ── Obras ─────────────────────────────────────────────────────────────────────
  // Fixed IDs make upsert idempotent without a unique constraint on name.
  const obra1 = await prisma.obra.upsert({
    where: { id: 'seed-obra-01' },
    create: {
      id: 'seed-obra-01',
      name: 'Torre Cóndor Norte',
      location: 'Av. del Libertador 4500, Buenos Aires',
      client: 'Inmobiliaria Cóndor S.A.',
      status: ObraStatus.EN_EJECUCION,
      active: true,
      startDate: new Date('2024-03-01'),
      theoreticalEndDate: new Date('2025-12-31'),
    },
    update: {},
  });

  const obra2 = await prisma.obra.upsert({
    where: { id: 'seed-obra-02' },
    create: {
      id: 'seed-obra-02',
      name: 'Centro Logístico Río Paraná',
      location: 'Ruta 9 Km 45, Rosario, Santa Fe',
      client: 'Logística Nacional S.R.L.',
      status: ObraStatus.PAUSADA,
      active: true,
      startDate: new Date('2023-09-15'),
      theoreticalEndDate: new Date('2025-06-30'),
    },
    update: {},
  });

  const obra3 = await prisma.obra.upsert({
    where: { id: 'seed-obra-03' },
    create: {
      id: 'seed-obra-03',
      name: 'Residencias del Parque',
      location: 'Mendoza 2100, Córdoba Capital',
      client: 'Desarrollos Urbanos S.A.',
      status: ObraStatus.FINALIZADA,
      active: false,
      startDate: new Date('2022-01-10'),
      theoreticalEndDate: new Date('2024-08-31'),
    },
    update: {},
  });

  console.log(`✓ Obras: "${obra1.name}" (${obra1.status}), "${obra2.name}" (${obra2.status}), "${obra3.name}" (${obra3.status}, inactiva)`);

  // ── Assignments ───────────────────────────────────────────────────────────────
  // supervisor1 → obra1 (EN_EJECUCION) and obra2 (PAUSADA)
  await prisma.asignacionObraSupervisor.upsert({
    where: { userId_obraId: { userId: supervisor1.id, obraId: obra1.id } },
    create: { userId: supervisor1.id, obraId: obra1.id },
    update: {},
  });

  await prisma.asignacionObraSupervisor.upsert({
    where: { userId_obraId: { userId: supervisor1.id, obraId: obra2.id } },
    create: { userId: supervisor1.id, obraId: obra2.id },
    update: {},
  });

  console.log(`✓ Asignaciones: supervisor1 → "${obra1.name}", "${obra2.name}"`);
  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
