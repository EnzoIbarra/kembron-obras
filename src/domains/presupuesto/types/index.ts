import type { Prisma } from '@prisma/client';

// Server-side types (Prisma.Decimal preserved)
export type ItemRow = {
  id: string;
  name: string;
  unit: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  theoreticalAmount: Prisma.Decimal;
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
