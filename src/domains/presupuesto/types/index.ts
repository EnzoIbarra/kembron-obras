import type { Prisma, ItemOrigin } from '@prisma/client';

// Server-side types (Prisma.Decimal preserved)
export type ItemRow = {
  id: string;
  name: string;
  unit: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  theoreticalAmount: Prisma.Decimal;
  origin: ItemOrigin;
  real: Prisma.Decimal;
  executed: Prisma.Decimal;
};

export type TituloRow = {
  id: string;
  name: string;
  sortOrder: number;
  items: ItemRow[];
  subtotal: { theoretical: Prisma.Decimal; real: Prisma.Decimal; executed: Prisma.Decimal };
};

export type PresupuestoData = {
  titulos: TituloRow[];
  total: { theoretical: Prisma.Decimal; real: Prisma.Decimal; executed: Prisma.Decimal };
};

// Client-side DTOs — Decimal fields serialized to string by JSON.stringify
export type ItemRowDto = {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  theoreticalAmount: string;
  origin: 'PRESUPUESTO_INICIAL' | 'ADICIONAL';
  real: string;
  executed: string;
};

export type TituloRowDto = {
  id: string;
  name: string;
  sortOrder: number;
  items: ItemRowDto[];
  subtotal: { theoretical: string; real: string; executed: string };
};

export type PresupuestoDataDto = {
  titulos: TituloRowDto[];
  total: { theoretical: string; real: string; executed: string };
};

// ── Change order DTO ──────────────────────────────────────────────────────────
// Reflects what GET /api/obras/[id]/adicionales-deductivos returns after JSON
// serialization: Decimal → string, Date → ISO string.
export type ChangeOrderRowDto = {
  id: string;
  type: 'ADICIONAL' | 'DEDUCTIVO';
  name: string;
  amount: string;
  description: string | null;
  createdAt: string;
  item: {
    id: string;
    name: string;
    titulo: { id: string; name: string };
  };
  usuario: { id: string; username: string };
};

// ── Gasto DTO ─────────────────────────────────────────────────────────────────
export type GastoRowDto = {
  id: string;
  description: string;
  category: 'MANO_DE_OBRA' | 'MATERIAL' | 'EQUIPO' | 'SUBCONTRATO' | 'OTROS';
  date: string; // Date → ISO string
  amount: string; // Decimal → string
  createdAt: string;
  item: {
    id: string;
    name: string;
    titulo: { id: string; name: string };
  };
  usuario: { id: string; username: string };
};
