CLAUDE.md — Kembron Construction Works Management System

Read this first, every session. For full detail, see docs/PROJECT_CONTEXT.md, docs/USER_STORIES.md, and docs/PLAN_4_DIAS.md.

What this is

A 4-day technical assessment MVP: a platform to plan, control, and track physical/financial progress of construction projects (obras). Grading priority: ~50% correct business logic, ~25% data model/code quality, ~15% UX, ~10% auth/seed/deploy. Build exactly the scope in docs/USER_STORIES.md — nothing more, nothing less.

Stack (locked)

Next.js App Router (full-stack, no separate backend) · pnpm · Prisma 5.22.0 pinned · PostgreSQL on Supabase · Vercel deploy · NextAuth (Credentials + bcrypt) · Zustand · React Query · Tailwind + Radix · Recharts v3 · custom-built Gantt (no library fits the required semantics).

Architecture (non-negotiable)

Screaming Architecture: src/domains/{obras,presupuesto,avance,usuarios}/{components,hooks,services,states,utils,types}. app/ stays thin — routes, layouts, route handlers only, delegating to domain services/. Zero business logic in components/. Files under ~150 lines. camelCase, English, for all code identifiers. Spanish only in user-facing UI strings.

The 7 business invariants — never violate these

Item.theoreticalAmount is frozen at creation, persisted, never recalculated.
Real budget and Executed are always computed at query time, never stored as columns.
An item created by an Adicional is a normal Item (origin = ADICIONAL), not a separate entity — schedulable and progress-trackable like any other item.
A Deductivo only affects an item's budget amount, never its physical quantity.
Every Gasto is charged against a specific Item — never directly against Titulo or Obra.
Monetary amounts and quantities use Decimal, never Float.
A Supervisor only ever sees/acts on obras explicitly assigned to them — enforced at the data/query layer, not just hidden in the UI.

Plus the schema-documented rule: when an Item.origin = ADICIONAL with a createdByAdicionalId, that specific AdicionalDeductivo is excluded from the item's real-budget sum (its value is already captured in theoreticalAmount — including it again would double-count it).

Working rules

Never guess about current project state. If something isn't covered in docs/ or isn't visible in the current codebase, ask before proceeding.
Reference images the client may share belong to a larger, unrelated system — visual inspiration only, never a feature spec. See docs/PROJECT_CONTEXT.md section 11 for the explicit out-of-scope list.
Any output from v0.dev pasted into this project is visual scaffolding only — extract the JSX/Tailwind, discard any mock data, fake fetching, or inline business logic, and rebuild data flow per this project's domain/service/hook architecture.
For day-by-day sequencing and what's already built vs pending, check docs/PLAN_4_DIAS.md.
