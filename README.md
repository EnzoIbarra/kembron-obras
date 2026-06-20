# Kembron Obras

Sistema de gestión de obras de construcción — evaluación técnica de 4 días.

Permite planificar, controlar y monitorear el avance físico y económico de proyectos de construcción (obras), con roles diferenciados para administradores y supervisores de campo.

---

## Requisitos previos

- Node.js 20+
- pnpm 11+
- Una base de datos PostgreSQL (se usa Supabase en este proyecto)

## Configuración local

**1. Clonar e instalar dependencias**

```bash
git clone <repo-url>
cd kembron-obras
pnpm install
```

**2. Variables de entorno**

Copiar `.env.example` a `.env.local` y completar los valores reales:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL via pgbouncer (puerto 6543 en Supabase) |
| `DIRECT_URL` | URL directa a PostgreSQL para migraciones de Prisma (puerto 5432 en Supabase) |
| `NEXTAUTH_SECRET` | Clave secreta para JWT de NextAuth. Generar con: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL base de la aplicación. En desarrollo: `http://localhost:3000` |

Ver `.env.example` para el formato exacto de cada variable.

**3. Aplicar migraciones y generar el cliente Prisma**

```bash
pnpm db:migrate    # aplica las migraciones a la base de datos
pnpm db:generate   # regenera el cliente Prisma (si se modificó el schema)
```

**4. Cargar datos de prueba**

```bash
pnpm db:seed
```

El seed es idempotente — puede ejecutarse múltiples veces sin errores.

**5. Levantar el servidor de desarrollo**

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000). El login redirige automáticamente al panel según el rol.

---

## Credenciales de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin123!` |
| Supervisor | `supervisor1` | `Supervisor1!` |
| Supervisor | `supervisor2` | `Supervisor2!` |

`supervisor1` tiene obras asignadas en la base de datos. `supervisor2` no tiene asignaciones iniciales.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm db:migrate` | Ejecutar migraciones de Prisma |
| `pnpm db:generate` | Regenerar cliente Prisma |
| `pnpm db:seed` | Cargar datos de prueba |
| `pnpm db:studio` | Abrir Prisma Studio (UI para explorar la BD) |

---

## Stack tecnológico

- **Framework**: Next.js 16 (App Router, full-stack)
- **Base de datos**: PostgreSQL en Supabase · Prisma ORM 5.22
- **Autenticación**: NextAuth v4 (Credentials + JWT)
- **UI**: Tailwind CSS v4 · Radix UI · Recharts v3
- **Estado**: Zustand v5 · TanStack Query v5
- **Deploy**: Vercel

## Arquitectura

Screaming Architecture: `src/domains/{obras,presupuesto,avance,usuarios}/` contiene toda la lógica de negocio (components, hooks, services, types). `app/` es delgado — solo routes, layouts y route handlers que delegan a los servicios de dominio.
