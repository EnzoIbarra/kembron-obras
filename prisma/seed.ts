import bcrypt from 'bcrypt';
import { PrismaClient, ObraStatus, Role, ChangeOrderType, ExpenseCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── 1. Users ─────────────────────────────────────────────────────────────
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

  // ── 2. Obras ──────────────────────────────────────────────────────────────
  // obra1: startDate 2026-01-05, theoreticalEndDate 2026-10-26 → 43 weeks total.
  // Today (2026-06-22) = week 25 of 43 — squarely in the middle.
  // update block includes dates so re-running corrects old seeds with 2024 dates.
  const obra1 = await prisma.obra.upsert({
    where: { id: 'seed-obra-01' },
    create: {
      id: 'seed-obra-01',
      name: 'Torre Cóndor Norte',
      location: 'Av. del Libertador 4500, Buenos Aires',
      client: 'Inmobiliaria Cóndor S.A.',
      status: ObraStatus.EN_EJECUCION,
      active: true,
      startDate: new Date('2026-01-05'),
      theoreticalEndDate: new Date('2026-10-26'),
    },
    update: {
      startDate: new Date('2026-01-05'),
      theoreticalEndDate: new Date('2026-10-26'),
    },
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
      startDate: new Date('2025-03-01'),
      theoreticalEndDate: new Date('2026-08-31'),
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

  console.log(`✓ Obras: "${obra1.name}" (${obra1.status}), "${obra2.name}" (${obra2.status}), "${obra3.name}" (inactiva)`);

  // ── 3. Assignments ────────────────────────────────────────────────────────
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

  // ── 4. Clean up existing obra1 budget data ────────────────────────────────
  // Needed for idempotency: the DB may have titulos/items from earlier UI testing
  // that conflict on @@unique([obraId, sortOrder]). Delete in FK-constraint order.
  const existingTitulos = await prisma.titulo.findMany({
    where: { obraId: obra1.id },
    include: { items: { select: { id: true } } },
  });
  const existingItemIds = existingTitulos.flatMap((t) => t.items.map((i) => i.id));

  if (existingItemIds.length > 0) {
    await prisma.registroAvance.deleteMany({ where: { itemId: { in: existingItemIds } } });
    await prisma.gasto.deleteMany({ where: { itemId: { in: existingItemIds } } });
    await prisma.programacionSemanal.deleteMany({ where: { itemId: { in: existingItemIds } } });
    await prisma.adicionalDeductivo.deleteMany({ where: { itemId: { in: existingItemIds } } });
    await prisma.item.deleteMany({ where: { id: { in: existingItemIds } } });
  }
  await prisma.titulo.deleteMany({ where: { obraId: obra1.id } });

  console.log('✓ Presupuesto anterior de obra1 eliminado (reset limpio)');

  // ── 5. Títulos ────────────────────────────────────────────────────────────
  const t1 = await prisma.titulo.create({
    data: { obraId: obra1.id, name: 'Obras Civiles y Fundaciones', sortOrder: 1 },
  });
  const t2 = await prisma.titulo.create({
    data: { obraId: obra1.id, name: 'Estructura de Hormigón', sortOrder: 2 },
  });
  const t3 = await prisma.titulo.create({
    data: { obraId: obra1.id, name: 'Mampostería y Terminaciones', sortOrder: 3 },
  });

  console.log(`✓ Títulos: "${t1.name}", "${t2.name}", "${t3.name}"`);

  // ── 6. Ítems ──────────────────────────────────────────────────────────────
  // theoreticalAmount = quantity × unitPrice — persisted frozen at creation (invariant 1).
  const i1 = await prisma.item.create({
    data: { tituloId: t1.id, name: 'Excavación y movimiento de suelo', quantity: 800,  unit: 'm³', unitPrice: 5000,  theoreticalAmount: 4000000  },
  });
  const i2 = await prisma.item.create({
    data: { tituloId: t1.id, name: 'Cimientos de hormigón ciclópeo',   quantity: 120,  unit: 'm³', unitPrice: 45000, theoreticalAmount: 5400000  },
  });
  const i3 = await prisma.item.create({
    data: { tituloId: t2.id, name: 'Columnas y vigas H-21',            quantity: 200,  unit: 'm³', unitPrice: 85000, theoreticalAmount: 17000000 },
  });
  const i4 = await prisma.item.create({
    data: { tituloId: t2.id, name: 'Losas de entrepiso H-21',          quantity: 350,  unit: 'm²', unitPrice: 42000, theoreticalAmount: 14700000 },
  });
  const i5 = await prisma.item.create({
    data: { tituloId: t3.id, name: 'Mampostería de ladrillo hueco',    quantity: 1500, unit: 'm²', unitPrice: 18000, theoreticalAmount: 27000000 },
  });
  const i6 = await prisma.item.create({
    data: { tituloId: t3.id, name: 'Contrapisos y carpetas',           quantity: 600,  unit: 'm²', unitPrice: 22000, theoreticalAmount: 13200000 },
  });

  console.log('✓ Ítems (6): presupuesto total teórico $81.3M ARS');

  // ── 7. Adicionales y Deductivos ───────────────────────────────────────────
  // ADICIONAL on i2 → raises real budget of Cimientos by 900,000.
  // DEDUCTIVO on i4 → lowers real budget of Losas by 1,470,000.
  await prisma.adicionalDeductivo.createMany({
    data: [
      {
        itemId: i2.id,
        type: ChangeOrderType.ADICIONAL,
        name: 'Refuerzo de fundaciones por suelo blando',
        amount: 900000,
        description: 'Suelo con baja capacidad portante: profundización +30 cm y hormigón adicional',
        userId: admin.id,
      },
      {
        itemId: i4.id,
        type: ChangeOrderType.DEDUCTIVO,
        name: 'Reducción de área de losa sector B',
        amount: 1470000,
        description: 'Rediseño arquitectónico elimina voladizo sector B — reduce superficie 35 m²',
        userId: admin.id,
      },
    ],
  });

  console.log('✓ Adicional (Cimientos +$900k) + Deductivo (Losas -$1.47M)');

  // ── 8. Programación semanal ───────────────────────────────────────────────
  // week N starts at: startDate + (N-1)*7 days (UTC).
  // Quantities per item sum to 100 % of the item's total planned quantity.
  // Stagger gives a realistic S-curve: civil works early, structure mid, finishes late.
  //   i1 Excavación  (800 m³):  weeks  1– 4  → 200/wk × 4 = 800
  //   i2 Cimientos   (120 m³):  weeks  3– 8  →  20/wk × 6 = 120
  //   i3 Columnas    (200 m³):  weeks  7–18  →  17/wk × 8 + 16/wk × 4 = 200
  //   i4 Losas       (350 m²):  weeks 12–22  →  32/wk × 9 + 31/wk × 2 = 350
  //   i5 Mampostería (1500 m²): weeks 16–32  →  88/wk ×16 + 92 = 1500
  //   i6 Contrapisos (600 m²):  weeks 26–36  →  55/wk ×10 + 50 = 600
  await prisma.programacionSemanal.createMany({
    data: [
      // i1 Excavación
      { itemId: i1.id, weekNumber: 1,  plannedQuantity: 200 },
      { itemId: i1.id, weekNumber: 2,  plannedQuantity: 200 },
      { itemId: i1.id, weekNumber: 3,  plannedQuantity: 200 },
      { itemId: i1.id, weekNumber: 4,  plannedQuantity: 200 },
      // i2 Cimientos
      { itemId: i2.id, weekNumber: 3,  plannedQuantity: 20 },
      { itemId: i2.id, weekNumber: 4,  plannedQuantity: 20 },
      { itemId: i2.id, weekNumber: 5,  plannedQuantity: 20 },
      { itemId: i2.id, weekNumber: 6,  plannedQuantity: 20 },
      { itemId: i2.id, weekNumber: 7,  plannedQuantity: 20 },
      { itemId: i2.id, weekNumber: 8,  plannedQuantity: 20 },
      // i3 Columnas y vigas
      { itemId: i3.id, weekNumber: 7,  plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 8,  plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 9,  plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 10, plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 11, plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 12, plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 13, plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 14, plannedQuantity: 17 },
      { itemId: i3.id, weekNumber: 15, plannedQuantity: 16 },
      { itemId: i3.id, weekNumber: 16, plannedQuantity: 16 },
      { itemId: i3.id, weekNumber: 17, plannedQuantity: 16 },
      { itemId: i3.id, weekNumber: 18, plannedQuantity: 16 },
      // i4 Losas
      { itemId: i4.id, weekNumber: 12, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 13, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 14, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 15, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 16, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 17, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 18, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 19, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 20, plannedQuantity: 32 },
      { itemId: i4.id, weekNumber: 21, plannedQuantity: 31 },
      { itemId: i4.id, weekNumber: 22, plannedQuantity: 31 },
      // i5 Mampostería
      { itemId: i5.id, weekNumber: 16, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 17, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 18, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 19, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 20, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 21, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 22, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 23, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 24, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 25, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 26, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 27, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 28, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 29, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 30, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 31, plannedQuantity: 88 },
      { itemId: i5.id, weekNumber: 32, plannedQuantity: 92 },
      // i6 Contrapisos (starts week 26 — just after today, week 25)
      { itemId: i6.id, weekNumber: 26, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 27, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 28, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 29, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 30, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 31, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 32, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 33, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 34, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 35, plannedQuantity: 55 },
      { itemId: i6.id, weekNumber: 36, plannedQuantity: 50 },
    ],
  });

  console.log('✓ Programación semanal: 61 celdas (i1 W1-4 | i2 W3-8 | i3 W7-18 | i4 W12-22 | i5 W16-32 | i6 W26-36)');

  // ── 9. Registros de avance ────────────────────────────────────────────────
  // Distributed across weeks 1–22 (all dates before today, week 25).
  // Per-item result:  i1=100%, i2=91.7%, i3=90%, i4=56.9%, i5=35%, i6=0%
  // Obra-level physical progress = simple average = ~62.3 % (target: 40–70 %)
  //
  // Date → week (startDate=2026-01-05, week N = startDate+(N-1)*7 days):
  //   W1=Jan05  W4=Jan26  W7=Feb16  W12=Mar23  W14=Apr06  W16=Apr20  W19=May11  W22=Jun01
  await prisma.registroAvance.createMany({
    data: [
      // i1 Excavación — 4×200 = 800/800 = 100 %
      { itemId: i1.id, userId: supervisor1.id, advancedQuantity: 200, date: new Date('2026-01-05') },
      { itemId: i1.id, userId: supervisor1.id, advancedQuantity: 200, date: new Date('2026-01-12') },
      { itemId: i1.id, userId: supervisor1.id, advancedQuantity: 200, date: new Date('2026-01-19') },
      { itemId: i1.id, userId: supervisor1.id, advancedQuantity: 200, date: new Date('2026-01-26') },
      // i2 Cimientos — 5×22 = 110/120 = 91.7 %
      { itemId: i2.id, userId: supervisor1.id, advancedQuantity: 22, date: new Date('2026-01-19') },
      { itemId: i2.id, userId: supervisor1.id, advancedQuantity: 22, date: new Date('2026-01-26') },
      { itemId: i2.id, userId: supervisor1.id, advancedQuantity: 22, date: new Date('2026-02-02') },
      { itemId: i2.id, userId: supervisor1.id, advancedQuantity: 22, date: new Date('2026-02-09') },
      { itemId: i2.id, userId: supervisor1.id, advancedQuantity: 22, date: new Date('2026-02-16') },
      // i3 Columnas y vigas — 12×15 = 180/200 = 90 %
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-02-16') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-02-23') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-03-02') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-03-09') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-03-16') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-03-23') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-03-30') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-04-06') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-04-13') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-04-20') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-04-27') },
      { itemId: i3.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-05-04') },
      // i4 Losas — 30+30+32+32+30+30+15 = 199/350 = 56.9 %
      { itemId: i4.id, userId: supervisor1.id, advancedQuantity: 30, date: new Date('2026-03-23') },
      { itemId: i4.id, userId: supervisor1.id, advancedQuantity: 30, date: new Date('2026-03-30') },
      { itemId: i4.id, userId: supervisor1.id, advancedQuantity: 32, date: new Date('2026-04-06') },
      { itemId: i4.id, userId: supervisor1.id, advancedQuantity: 32, date: new Date('2026-04-13') },
      { itemId: i4.id, userId: supervisor1.id, advancedQuantity: 30, date: new Date('2026-04-20') },
      { itemId: i4.id, userId: supervisor1.id, advancedQuantity: 30, date: new Date('2026-05-04') },
      { itemId: i4.id, userId: supervisor1.id, advancedQuantity: 15, date: new Date('2026-05-11') },
      // i5 Mampostería — 7×75 = 525/1500 = 35 %
      { itemId: i5.id, userId: supervisor1.id, advancedQuantity: 75, date: new Date('2026-04-20') },
      { itemId: i5.id, userId: supervisor1.id, advancedQuantity: 75, date: new Date('2026-04-27') },
      { itemId: i5.id, userId: supervisor1.id, advancedQuantity: 75, date: new Date('2026-05-04') },
      { itemId: i5.id, userId: supervisor1.id, advancedQuantity: 75, date: new Date('2026-05-11') },
      { itemId: i5.id, userId: supervisor1.id, advancedQuantity: 75, date: new Date('2026-05-18') },
      { itemId: i5.id, userId: supervisor1.id, advancedQuantity: 75, date: new Date('2026-05-25') },
      { itemId: i5.id, userId: supervisor1.id, advancedQuantity: 75, date: new Date('2026-06-01') },
      // i6 Contrapisos — 0/600 = 0 % (work begins week 26 = Jun 22, today)
    ],
  });

  console.log('✓ Avance real: 35 registros — avance físico ~62.3% (i1=100%, i2=91.7%, i3=90%, i4=56.9%, i5=35%, i6=0%)');

  // ── 10. Gastos ────────────────────────────────────────────────────────────
  // Covers all 5 ExpenseCategory values across items from all 3 títulos.
  await prisma.gasto.createMany({
    data: [
      { itemId: i1.id, userId: admin.id,       category: ExpenseCategory.MANO_DE_OBRA, amount: 800000,  date: new Date('2026-01-12'), description: 'Jornales equipo excavación semanas 1–2' },
      { itemId: i1.id, userId: admin.id,       category: ExpenseCategory.EQUIPO,       amount: 1200000, date: new Date('2026-01-19'), description: 'Alquiler retroexcavadora Caterpillar 3 semanas' },
      { itemId: i2.id, userId: admin.id,       category: ExpenseCategory.MATERIAL,     amount: 2100000, date: new Date('2026-02-02'), description: 'Hormigón ciclópeo H-15 (60 m³)' },
      { itemId: i2.id, userId: supervisor1.id, category: ExpenseCategory.MANO_DE_OBRA, amount: 750000,  date: new Date('2026-02-16'), description: 'Jornales armadores y hormigoneros semanas 5–7' },
      { itemId: i3.id, userId: admin.id,       category: ExpenseCategory.MATERIAL,     amount: 4500000, date: new Date('2026-03-09'), description: 'Hierro ADN 420 y cemento para estructura H-21' },
      { itemId: i3.id, userId: supervisor1.id, category: ExpenseCategory.MANO_DE_OBRA, amount: 2800000, date: new Date('2026-04-06'), description: 'Jornales armadores semanas 10–14' },
      { itemId: i3.id, userId: admin.id,       category: ExpenseCategory.SUBCONTRATO,  amount: 1500000, date: new Date('2026-04-20'), description: 'Subcontrato encofrado metálico y bombeo de hormigón' },
      { itemId: i4.id, userId: admin.id,       category: ExpenseCategory.MATERIAL,     amount: 3200000, date: new Date('2026-04-13'), description: 'Hormigón H-21 y malla electrosoldada ME-15' },
      { itemId: i4.id, userId: supervisor1.id, category: ExpenseCategory.MANO_DE_OBRA, amount: 1800000, date: new Date('2026-05-04'), description: 'Jornales hormigonado de losas semanas 15–18' },
      { itemId: i5.id, userId: admin.id,       category: ExpenseCategory.MATERIAL,     amount: 3600000, date: new Date('2026-05-18'), description: 'Ladrillos huecos 8×18×33 y mortero (aprox. 3.000 m²)' },
      { itemId: i5.id, userId: supervisor1.id, category: ExpenseCategory.MANO_DE_OBRA, amount: 2100000, date: new Date('2026-06-08'), description: 'Jornales albañiles semanas 16–23' },
      { itemId: i6.id, userId: admin.id,       category: ExpenseCategory.OTROS,        amount: 150000,  date: new Date('2026-06-15'), description: 'Materiales de replanteo y preparación de contrapisos' },
    ],
  });

  console.log('✓ Gastos: 12 registros (MANO_DE_OBRA, EQUIPO, MATERIAL, SUBCONTRATO, OTROS)');
  console.log('\n✅ Seed completado.');
  console.log('   Credenciales → admin / Admin123!  ·  supervisor1 / Supervisor1!  ·  supervisor2 / Supervisor2!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
