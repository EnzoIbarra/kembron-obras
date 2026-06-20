-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "ObraStatus" AS ENUM ('EN_EJECUCION', 'FINALIZADA', 'PAUSADA');

-- CreateEnum
CREATE TYPE "ItemOrigin" AS ENUM ('PRESUPUESTO_INICIAL', 'ADICIONAL');

-- CreateEnum
CREATE TYPE "ChangeOrderType" AS ENUM ('ADICIONAL', 'DEDUCTIVO');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MANO_DE_OBRA', 'MATERIAL', 'EQUIPO', 'SUBCONTRATO', 'OTROS');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "status" "ObraStatus" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATE NOT NULL,
    "theoreticalEndDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionObraSupervisor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsignacionObraSupervisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Titulo" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Titulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "tituloId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "theoreticalAmount" DECIMAL(12,2) NOT NULL,
    "origin" "ItemOrigin" NOT NULL DEFAULT 'PRESUPUESTO_INICIAL',
    "createdByAdicionalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdicionalDeductivo" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "ChangeOrderType" NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdicionalDeductivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramacionSemanal" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "plannedQuantity" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramacionSemanal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAvance" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "advancedQuantity" DECIMAL(12,3) NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroAvance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE INDEX "AsignacionObraSupervisor_userId_idx" ON "AsignacionObraSupervisor"("userId");

-- CreateIndex
CREATE INDEX "AsignacionObraSupervisor_obraId_idx" ON "AsignacionObraSupervisor"("obraId");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionObraSupervisor_userId_obraId_key" ON "AsignacionObraSupervisor"("userId", "obraId");

-- CreateIndex
CREATE INDEX "Titulo_obraId_idx" ON "Titulo"("obraId");

-- CreateIndex
CREATE UNIQUE INDEX "Titulo_obraId_sortOrder_key" ON "Titulo"("obraId", "sortOrder");

-- CreateIndex
CREATE INDEX "Item_tituloId_idx" ON "Item"("tituloId");

-- CreateIndex
CREATE INDEX "Item_createdByAdicionalId_idx" ON "Item"("createdByAdicionalId");

-- CreateIndex
CREATE INDEX "AdicionalDeductivo_itemId_idx" ON "AdicionalDeductivo"("itemId");

-- CreateIndex
CREATE INDEX "AdicionalDeductivo_userId_idx" ON "AdicionalDeductivo"("userId");

-- CreateIndex
CREATE INDEX "Gasto_itemId_idx" ON "Gasto"("itemId");

-- CreateIndex
CREATE INDEX "Gasto_date_idx" ON "Gasto"("date");

-- CreateIndex
CREATE INDEX "ProgramacionSemanal_itemId_idx" ON "ProgramacionSemanal"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramacionSemanal_itemId_weekNumber_key" ON "ProgramacionSemanal"("itemId", "weekNumber");

-- CreateIndex
CREATE INDEX "RegistroAvance_itemId_idx" ON "RegistroAvance"("itemId");

-- CreateIndex
CREATE INDEX "RegistroAvance_date_idx" ON "RegistroAvance"("date");

-- AddForeignKey
ALTER TABLE "AsignacionObraSupervisor" ADD CONSTRAINT "AsignacionObraSupervisor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionObraSupervisor" ADD CONSTRAINT "AsignacionObraSupervisor_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Titulo" ADD CONSTRAINT "Titulo_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_tituloId_fkey" FOREIGN KEY ("tituloId") REFERENCES "Titulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_createdByAdicionalId_fkey" FOREIGN KEY ("createdByAdicionalId") REFERENCES "AdicionalDeductivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdicionalDeductivo" ADD CONSTRAINT "AdicionalDeductivo_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdicionalDeductivo" ADD CONSTRAINT "AdicionalDeductivo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramacionSemanal" ADD CONSTRAINT "ProgramacionSemanal_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAvance" ADD CONSTRAINT "RegistroAvance_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAvance" ADD CONSTRAINT "RegistroAvance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
