# User stories — Construction Works Management System (Kembron)

> Derived strictly from the PDF requirements. Companion document to PROJECT_CONTEXT.md — read that first for business rules and architecture before implementing any story. Each story includes acceptance criteria. Do not implement anything beyond what's listed here without explicit confirmation.

## Epic 1 — Authentication & users

### US-1.1 — Login
As a user (Admin or Supervisor), I want to log in with username and password, so I can access the system according to my role.
- Acceptance: login form with username + password. Invalid credentials show a clear error. Passwords are hashed (bcrypt) and never stored or logged in plaintext.

### US-1.2 — Role-based redirect
As a logged-in user, I want to be redirected to the right interface for my role.
- Acceptance: ADMIN → desktop panel (obras list / dashboard). SUPERVISOR → mobile view (assigned obras list).

### US-1.3 — Logout
As a logged-in user, I want to log out, so my session ends securely.
- Acceptance: logout action clears the session and redirects to login.

### US-1.4 — User management (admin only)
As an Admin, I want to create, edit, and delete users, so I can manage who has access to the system.
- Acceptance: form with username, password, role (ADMIN/SUPERVISOR). Edit allows changing role and obra assignments. Delete requires confirmation. Non-admins cannot access this module (enforced server-side, not just hidden in UI).

### US-1.5 — Assign obras to supervisor
As an Admin, I want to assign one or more obras to a Supervisor, so they only see relevant work.
- Acceptance: multi-select of active obras when creating/editing a supervisor user. A supervisor can have zero, one, or multiple obras assigned.

## Epic 2 — Admin global dashboard

### US-2.1 — Global indicator cards
As an Admin, I want to see global indicators on login, so I get an overview of all construction projects.
- Acceptance: cards showing — active obras count, deactivated obras count, total budget (sum of all obras' real budget), average physical progress (simple average across all active obras).

### US-2.2 — Consolidated physical progress chart
As an Admin, I want to see consolidated physical progress across all obras.
- Acceptance: chart (Recharts) showing aggregated physical progress, planned vs actual where applicable.

### US-2.3 — Budgeted vs executed comparison
As an Admin, I want to compare budgeted vs executed amounts per obra.
- Acceptance: comparison bar chart, one bar pair (or grouped bars) per obra, budgeted real amount vs executed amount.

## Epic 3 — Obras module

### US-3.1 — Obras card list
As an Admin, I want to see all obras as cards, so I can scan status at a glance.
- Acceptance: each card shows name, location, client, status (En ejecución/Finalizada/Pausada), period (start–theoretical end), physical progress bar, economic progress bar. List includes both active and deactivated obras with visual distinction.

### US-3.2 — Create obra
As an Admin, I want to create a new obra.
- Acceptance: form with name, location, client, status, start date, theoretical end date. New obra defaults to active.

### US-3.3 — Edit obra
As an Admin, I want to edit an existing obra's details.
- Acceptance: same fields as creation, pre-filled with current values.

### US-3.4 — Deactivate/reactivate obra
As an Admin, I want to deactivate an obra, so it stops counting as active without deleting its data.
- Acceptance: toggle action. Deactivating updates dashboard counters (US-2.1) immediately. Data (budget, progress, expenses) is preserved, not deleted.

## Epic 4 — Single obra: Resumen tab

### US-4.1 — Obra summary dashboard
As an Admin, I want to see a detailed dashboard when I open a specific obra.
- Acceptance: physical progress %, economic progress %, days elapsed since start + % of time elapsed (based on start/theoretical end dates), progress by title (each title with its computed %).

### US-4.2 — Physical S-curve
As an Admin, I want to see planned vs actual physical progress over time.
- Acceptance: cumulative S-curve chart, two series (planned from schedule, actual from progress records), x-axis = weeks since obra start.

### US-4.3 — Financial S-curve
As an Admin, I want to see budgeted vs executed amounts over time.
- Acceptance: cumulative S-curve chart, two series (planned from scheduled qty × unit price, actual from expenses by date), x-axis = weeks since obra start.

## Epic 5 — Single obra: Presupuesto tab → Títulos e ítems

### US-5.1 — Create title (stage)
As an Admin, I want to create budget titles (stages) within an obra, so I can organize the budget hierarchically.
- Acceptance: form with name and order/sequence. Titles belong to exactly one obra.

### US-5.2 — Create item within a title
As an Admin, I want to create executable line items inside a title.
- Acceptance: form with name, quantity, unit, unit price. Theoretical amount = quantity × unitPrice, computed and frozen at creation (US never recalculates this field later).

### US-5.3 — Budget table with three calculated columns
As an Admin, I want to see Theoretical / Real / Executed for every item, title, and the obra total.
- Acceptance: table shows all three columns at item level, aggregated (summed) at title level, aggregated at obra-total level. Real and Executed are always computed live, never stored. Formulas exactly as in PROJECT_CONTEXT.md section 4.

## Epic 6 — Single obra: Presupuesto tab → Adicionales y deductivos

### US-6.1 — Create a deduction (deductivo)
As an Admin, I want to register a deduction against an existing item, so the real budget reflects a reduction.
- Acceptance: form requires selecting an existing item (mandatory — deductions can never create new items), amount (or quantity × unit price), name/description. Reduces that item's real budget only — never touches its physical quantity.

### US-6.2 — Create an addition (adicional) on an existing item
As an Admin, I want to register an addition that increases an existing item's budget.
- Acceptance: form: select existing item, amount (or quantity × unit price), name/description. Increases that item's real budget.

### US-6.3 — Create an addition that adds a new item
As an Admin, I want an addition to be able to create a brand new item, inside an existing or a new title.
- Acceptance: the new item is a normal Item record with `origin = ADDITION` and a relation back to the Addition that created it. It must be schedulable (Epic 7) and able to receive progress records (Epic 8) exactly like any initial-budget item.

## Epic 7 — Single obra: Presupuesto tab → Gastos

### US-7.1 — Register an expense
As an Admin, I want to log an expense against a specific item.
- Acceptance: form with description, category (Mano de obra/Material/Equipo/Subcontrato/Otros), date, amount, associated item (mandatory — never optional, never a title or obra). Stores the logging user automatically.

### US-7.2 — Expenses feed the Executed column
As an Admin, I want logged expenses to automatically update the Executed values shown in the budget table (US-5.3).
- Acceptance: Executed at item level = sum of its expenses. Title/obra Executed = sum of their items' expenses. Always computed live.

## Epic 8 — Single obra: Avance tab → Programación

### US-8.1 — Weekly schedule grid
As an Admin, I want a table with items on rows and weeks as columns, to plan how much quantity will be advanced each week.
- Acceptance: left side lists titles and items hierarchically (titles shown as group headers, no quantity input on title rows). Right side has one column per week, calculated from the obra's start date and theoretical end date. Each item-week cell accepts a planned quantity.

### US-8.2 — Schedule generates planned curve
As an Admin, I want the schedule I entered to automatically generate the planned physical and financial S-curve data.
- Acceptance: changing any scheduled quantity updates the planned curve series (US-4.2, US-4.3) and the Gantt chart (Epic 10) without manual recalculation steps.

## Epic 9 — Single obra: Avance tab → Avance real

### US-9.1 — Log actual progress
As an Admin or Supervisor, I want to log actual progress on an item.
- Acceptance: form: select item, enter advanced quantity, enter date. Creates a progress record storing date, quantity, and the logging user. Does not overwrite previous records — each log is additive and cumulative.

### US-9.2 — Actual progress generates the actual curve
As an Admin, I want logged progress to automatically feed the actual physical S-curve.
- Acceptance: each new record updates the cumulative actual curve (US-4.2) without manual steps. Example from spec: item "Muro de ladrillo" totaling 100 m² — logging 10, then 10, then 10 in separate records yields 30 m² cumulative = 30% item progress.

### US-9.3 — Collapsible progress summary
As an Admin, I want to drill down from titles → items → individual progress records.
- Acceptance: expandable list: titles expand to show their items; each item expands to show all its progress records (date, quantity, logging user), most recent first or chronological — pick one and be consistent.

## Epic 10 — Single obra: Avance tab → Gantt (automatic)

### US-10.1 — Auto-generated Gantt chart
As an Admin, I want a Gantt chart generated automatically from the schedule and actual progress, without manual chart editing.
- Acceptance: one row per title and one row per item. Each item's bar spans from its first to its last scheduled week (from Epic 8 data). Bar fill % = that item's actual physical progress % (from Epic 9 data, using the formula in PROJECT_CONTEXT.md section 4). A vertical line marks the current week (calculated from today's date vs obra weeks). Changing the schedule (Epic 8) regenerates the Gantt automatically — no separate "rebuild Gantt" action exists.

## Epic 11 — Supervisor app (mobile/responsive)

### US-11.1 — Supervisor login and assigned-obras list
As a Supervisor, I want to log in and see only the obras assigned to me.
- Acceptance: after login, list shows only obras where an AsignacionObraSupervisor links this user. No access to obras list of other supervisors, no access to the admin configuration module — enforced at the data/query layer, not just hidden in the UI.

### US-11.2 — Supervisor logs progress
As a Supervisor, I want to log actual progress for an item in one of my assigned obras, from my phone.
- Acceptance: same underlying logic as US-9.1, mobile-first responsive form: select item (scoped to assigned obra), quantity, date. Stores logging user automatically.

### US-11.3 — Supervisor logs an expense
As a Supervisor, I want to log an expense for an item in one of my assigned obras, from my phone.
- Acceptance: same underlying logic as US-7.1, mobile-first responsive form: category, date, amount, description, item (scoped to assigned obra). Stores logging user automatically.

## Epic 12 — Seed data (required for delivery)

### US-12.1 — Realistic seed dataset
As an evaluator, I want the deployed system to already contain realistic example data, so I can test every feature without manual setup.
- Acceptance: seed script creates — 1 admin user, 1–2 supervisor users; 2–3 obras (at least one active, at least one deactivated); at least one fully populated obra with titles, items, a complete weekly schedule, multiple actual progress records (enough to show meaningful curve/Gantt fill), expenses spanning different categories, at least one addition and one deduction. Credentials documented in README.

---

## Explicitly out of scope — do not generate stories or code for these
Purchase requests (Solicitudes de compra), Subcontractors module, Materials catalog, Material consumption tracking, Collections schedule (Cronograma de cobros), Finance module, Excel/PDF export, notifications, password recovery flow. These appear only in client-shared reference images from an unrelated, larger system.
