# Project context — Construction Works Management System (Kembron)

> This document gives full business and technical context for an AI coding assistant (Claude Console) working on this project. Read this before writing any code. If anything about the current project state is unclear or not covered here, ask — never assume or guess.

## 1. What this project is

This is a technical assessment (4-day build) for Kembron, a company that builds custom software for construction companies. The deliverable is an MVP of a platform to plan, control, and track the physical and financial progress of construction projects (obras).

**The grading priority is explicit and must guide every decision:**
- ~50% — Correct business logic (calculations, curves, Gantt chart, roles, permissions)
- ~25% — Data model and code quality (organized, understandable)
- ~15% — Clean UX and clear navigation
- ~10% — Auth/roles, seed data, and working deploy

Business logic correctness matters far more than visual polish. When in doubt about scope, build exactly what's specified below — nothing more, nothing less. Reference images that may be shared belong to a larger, unrelated system and are visual inspiration only, not a feature spec.

## 2. Domain glossary (Spanish business terms — keep these exact terms in DB schema comments, docs, and UI strings; translate concepts to English for code identifiers)

| Spanish term | English concept | Notes |
|---|---|---|
| Obra | Construction project/site | The top-level entity everything belongs to |
| Título | Title / stage / chapter | A budget category grouping items (e.g. "Obras preliminares", "Estructuras") |
| Ítem | Line item | An executable unit of work with quantity, unit, unit price |
| Presupuesto Teórico | Theoretical budget | Original frozen budget: quantity × unit price |
| Presupuesto Real | Real/adjusted budget | Theoretical + additions − deductions |
| Ejecutado | Executed/spent | Sum of expenses charged to an item |
| Adicional | Addition (change order, positive) | Increases budget |
| Deductivo | Deduction (change order, negative) | Decreases budget, always tied to an existing item |
| Avance físico | Physical progress | % based on quantity completed vs total quantity |
| Avance económico | Financial/economic progress | % based on money spent vs real budget |
| Curva S | S-curve | Cumulative progress curve over time (planned vs actual) |
| Programación semanal | Weekly schedule | Planned quantity per item per week |
| Registro de avance | Progress record | An actual logged advance: item + quantity + date |
| Gasto | Expense | A logged cost: category + amount + date + item |
| Cronograma / Gantt | Gantt chart | Auto-generated from weekly schedule + actual progress |

## 3. Roles and platforms

| Role | Platform | Access |
|---|---|---|
| Administrador (ADMIN) | Desktop web (not required to be responsive) | Full access: create/edit obras, budgets, change orders, scheduling, users. Sees all dashboards. |
| Supervisor (SUPERVISOR) | Responsive web (mobile-first, used from phone) | Sees only assigned obras. Logs actual progress and expenses against items. No access to configuration or other obras. |

Every progress record and expense stores which user created it.

## 4. Core business rules and formulas (must match exactly — this is the most heavily weighted part of the grading)

### Budget
- Theoretical (item) = quantity × unitPrice
- Theoretical (title/obra) = sum of its items
- Real (item) = theoretical + sum(additions) − sum(deductions)
- Executed = sum of expenses charged to that item/title/obra (always aggregated upward from item-level expenses — expenses are never created directly against a title or obra)

### Physical progress (simple average, NOT weighted)
- Item = min(100, cumulativeAdvancedQuantity / totalQuantity × 100)
- Title = simple average of its items' %
- Obra = simple average of all its items' %
- Global dashboard average = simple average of physical progress across all obras

### Financial/economic progress
- Obra = totalExecuted / totalRealBudget × 100

### S-curves (cumulative, week by week)
- Planned physical → from the weekly schedule
- Actual physical → from actual progress records
- Planned financial → Σ(weekly scheduled quantity × unit price), cumulative
- Actual financial → expenses accumulated by date

### Other
- Days elapsed = today − obra start date
- Gantt bar: spans from an item's first to last scheduled week; fill % = item's actual progress %; vertical line marks the current week; auto-updates when the schedule changes

## 5. Critical business invariants (do not violate these)

1. **Theoretical budget is frozen at creation** and never recalculated — it's a persisted field, not derived.
2. **Real budget and Executed are always computed at query time**, never stored as columns — prevents stale data when additions/deductions/expenses are edited or deleted after creation.
3. **An item created by an Addition (Adicional) is a normal Item record**, not a separate entity — same model, with an `origin` field (`INITIAL_BUDGET` | `ADDITION`) and an optional relation to the Addition that created it. It can be scheduled and receive progress records exactly like any other item.
4. **A Deduction (Deductivo) only affects the budget amount of an item, never its physical quantity.** Physical progress (quantity-based) and financial progress (amount-based) are deliberately independent dimensions — never let one affect the other's source data.
5. **Every expense is always charged against a specific Item — never directly against a Title or Obra.** Title/obra-level "Executed" totals are always upward aggregations of their items' expenses.
6. **Monetary amounts and quantities use Decimal/Numeric types, never Float**, to avoid rounding errors in cumulative sums (budget aggregation, S-curve accumulation).
7. A Supervisor can only ever see and act on obras explicitly assigned to them — enforce this at the data access layer, not just hidden in the UI.

## 6. Functional scope (build exactly this — nothing more, nothing less)

### 6.1 Auth and users
- Username + password login, secure password hashing (bcrypt via NextAuth Credentials provider)
- Logout
- Role-based redirect after login: ADMIN → desktop panel, SUPERVISOR → mobile view
- Admin-only "Users & roles" module: create/edit/delete users, assign role, assign one or more obras to a supervisor

### 6.2 Admin global dashboard
Cards: active obras count, deactivated obras count, total budget (sum across obras), average physical progress (simple average across obras).
Charts: consolidated physical progress across all obras, budgeted vs executed by obra (comparison bars).

### 6.3 Obras module
- Card-list view: name, location, client, status (En ejecución / Finalizada / Pausada), period (start–theoretical end date), physical progress bar, economic progress bar
- Create/edit obra: name, location, client, status, active/inactive, start date, theoretical end date
- Deactivate toggle (affects dashboard counters)

### 6.4 Single obra view — tabs: Resumen · Presupuesto · Avance

**Resumen (obra dashboard)**: physical progress, economic progress, days elapsed + % of time elapsed, physical S-curve (planned vs actual), financial S-curve (budgeted vs executed), progress by title with % each.

**Presupuesto — 3 sub-tabs:**
- *Títulos e ítems*: create titles, create items inside titles (name, quantity, unit, unit price). Table columns: Theoretical / Real / Executed at item, title, and obra-total level.
- *Adicionales y deductivos*: create an addition or deduction (name, associated item/title, amount or quantity × unit price). Deduction always ties to an existing item, subtracts from its budgeted amount. Addition can increase an existing item or add a new item inside a title (existing or new).
- *Gastos*: register expense (description, category: Mano de obra/Material/Equipo/Subcontrato/Otros, date, amount, associated item, user who logged it). Expenses feed the Executed column.

**Avance — 3 sub-sections:**
- *Programación*: table with titles/items on the left, one column per week of the obra's duration (calculated from start/theoretical end dates) on the right. Each item gets a scheduled quantity per week (titles carry no quantity). This generates the planned curve (physical and financial).
- *Avance real*: log progress (select item, enter advanced quantity and date) — creates a record (date, quantity, logging user). Generates the actual curve. Collapsible summary: titles → expand to items → expand to all progress records (date, quantity, user) for that item.
- *Gantt (automatic)*: one row per title and per item, as described in section 4.

### 6.5 Supervisor app (responsive/mobile)
Login, list of assigned obras only, per-obra: log actual progress (item + quantity + date) and log expense (category + date + amount + description + item). Everything logged stores the acting user.

## 7. Tech stack (locked — do not deviate)

| Layer | Choice |
|---|---|
| Framework | Next.js, App Router, full-stack (front + API in one app — no separate backend) |
| Package manager | pnpm |
| ORM | Prisma **5.22.0** (pinned exact version, not ^5.22.0) |
| Database | PostgreSQL hosted on Supabase |
| Deploy | Vercel |
| Auth | NextAuth (Auth.js), Credentials provider, bcrypt password hashing |
| Client state | Zustand |
| Server state | React Query (TanStack Query) |
| UI | Tailwind CSS + Radix UI |
| Charts (S-curves, bar charts) | Recharts |
| Gantt chart | Custom-built (CSS Grid / SVG) — no off-the-shelf library fits the required semantics (weekly granularity, fill % from actual progress, current-week marker, auto-regeneration from schedule changes) |

## 8. Architecture — Screaming Architecture, strict layering

Folders are organized by **business domain**, not technical layer. `app/` (App Router) stays thin: routes, layouts, and route handlers only — route handlers immediately delegate to domain `services/`, never contain business logic themselves.

```
src/
  app/
    (admin)/          → desktop layout: obras, presupuesto, usuarios, dashboard
    (supervisor)/     → mobile layout: assigned obras, log progress/expense
    api/[domain]/route.ts  → thin route handlers, delegate to services/
  domains/
    obras/
      components/     → UI only, no business logic
      hooks/          → client-side logic encapsulation
      services/       → API calls / business logic / data access
      states/         → Zustand stores
      utils/          → pure calculation functions
      types/
    presupuesto/      → same structure
    avance/           → same structure
    usuarios/         → same structure, includes auth/ subfolder
  shared/
    ui/               → reusable cross-domain UI primitives
    lib/prisma.ts     → Prisma client singleton
  prisma/
    schema.prisma
    seed.ts
```

**Hard rules:**
- `components/` contains zero business logic — only presentation.
- All business logic lives in `services/` or `utils/` (pure functions), never inline in components or route handlers.
- Files should stay under ~150 lines; split when they grow beyond that.
- No hardcoded obra-specific data anywhere.
- Naming: camelCase for all functions, variables, files, and folders. English for all code identifiers. Spanish only in user-facing UI strings (labels, buttons, messages shown to the end user).

## 9. Data model — entities and key relationships

Core entities (see accompanying ERD/schema document for full field list): `Usuario`, `Obra`, `AsignacionObraSupervisor`, `Titulo`, `Item`, `AdicionalDeductivo`, `Gasto`, `ProgramacionSemanal`, `RegistroAvance`.

Key relationship principle: **almost everything hangs off `Item`**, not `Titulo` or `Obra` directly — `AdicionalDeductivo`, `Gasto`, `ProgramacionSemanal`, and `RegistroAvance` all have a foreign key to `itemId`. Title and obra-level totals are always aggregations computed from their items, never independent data entry points.

`Usuario.rol` is a simple enum (`ADMIN` | `SUPERVISOR`), not a separate Role table — scope doesn't call for dynamic permissions.

## 10. Seed data requirements (required for delivery)

- 1 admin user, 1–2 supervisor users
- 2–3 obras (at least one active, at least one deactivated)
- At least one fully fleshed-out obra: titles, items, weekly schedule, multiple actual progress records, expenses across different categories, at least one addition and one deduction — so every curve, bar, and the Gantt chart render with real, non-trivial data
- Test credentials (admin and supervisor) must be documented in the README

## 11. Out of scope (explicitly excluded — do not build)

These appear in reference images shared by the client but belong to a larger, unrelated system: Solicitudes de compra (purchase requests), Subcontratistas, Catálogo de materiales, Consumo de insumos, Cronograma de cobros, Finanzas module, Excel/PDF export, notifications, password recovery. Do not add these or any other feature not explicitly listed in section 6.

## 12. Working process with this assistant

- Never guess about current project state (existing files, schema state, what's already implemented). If something isn't covered by this document or isn't visible in the current codebase context, ask explicitly before proceeding.
- This document and any accompanying decision/architecture docs take priority for planning. The actual current code in this project takes priority over any assumption when the two would conflict — always verify against real project state.
- The developer will sometimes paste output from v0.dev (Vercel's UI generator) for visual/markup reference. That output is **visual only** — treat any business logic, mock data, or fake data-fetching it contains as disposable scaffolding to be replaced, not as a source of truth. Extract the JSX/Tailwind structure, then rebuild data flow according to this project's domain/service/hook architecture.
