# Plan de ejecución — 4 días (Kembron, Sistema de Gestión y Control de Obras)

> Documento de control de avance. Marca el orden de dependencias reales entre piezas del sistema y el objetivo mínimo de cada día. No es un horario rígido: si un día se completa antes de tiempo, se continúa con el siguiente sin esperar. Se usa para validar avance contra plan en cualquier punto de los 4 días.

## Principio de secuenciación (por qué este orden y no otro)

El orden de construcción está determinado por dependencias de datos reales, no por el orden en que aparecen las secciones del PDF:

1. **Modelo de datos + auth deben estar primero**, sin excepción — todo lo demás depende de tener entidades reales y de saber quién es el usuario logueado (para roles y `usuarioId` en cada registro).
2. **Presupuesto (Títulos/Ítems) debe existir antes que Programación semanal** — no se puede programar avance semanal de un ítem que no existe.
3. **Programación semanal debe existir antes que el Gantt y las curvas planificadas** — el Gantt y la curva S planificada se derivan de la programación, no al revés.
4. **Avance real y Gastos pueden construirse en paralelo con Programación** una vez que existen ítems — son independientes entre sí, ambos dependen solo de que el ítem exista.
5. **Curvas S, Gantt y dashboards (Resumen, global) van al final** — son agregaciones/visualizaciones que leen de todo lo anterior. Construirlos antes implicaría maquetar con datos falsos y rehacer.
6. **Seed data se escribe en paralelo a cada bloque**, no se deja para el final — cada entidad nueva en el schema suma su seed correspondiente de inmediato, así el sistema es probable visualmente desde temprano y no hay una carga masiva de datos al final del día 4 bajo presión.
7. **Deploy a Vercel se valida incremental desde el día 1** (auth + obras vacío funcionando en producción), no se deja como única tarea del día 4.

## Vista general

| Día | Objetivo mínimo | Epics cubiertas |
|---|---|---|
| 1 | Proyecto corriendo en Vercel con auth funcional y CRUD de Obras | Setup, Epic 1, Epic 3 |
| 2 | Presupuesto completo (títulos, ítems, adicionales/deductivos, gastos) con cálculos correctos | Epic 5, 6, 7 |
| 3 | Programación semanal, avance real, Gantt automático funcionando | Epic 8, 9, 10 |
| 4 | Curvas S, dashboards (obra + global), app Supervisor, seed final, pulido UX, deploy final | Epic 4, 2, 11, 12 + QA |

---

## Día 1 — Fundación: setup, modelo de datos, auth, CRUD Obras

### Objetivo del día
Al final del día 1: el proyecto está deployado en Vercel, se puede hacer login con un usuario admin de seed, y el admin puede crear/editar/listar/desactivar obras. Sin esto funcionando, nada del resto tiene sentido construir.

### Bloque 1.1 — Setup del proyecto
- Inicializar proyecto Next.js (App Router) con pnpm
- Configurar TypeScript, ESLint, Tailwind
- Crear estructura de carpetas Screaming Architecture (`domains/`, `shared/`, `app/(admin)/`, `app/(supervisor)/`)
- Conectar repositorio a GitHub
- Crear proyecto en Supabase, obtener connection string
- Conectar proyecto a Vercel (deploy inicial vacío, solo para validar que el pipeline funciona)

### Bloque 1.2 — Modelo de datos completo
- Escribir `schema.prisma` completo (todas las entidades: Usuario, Obra, AsignacionObraSupervisor, Titulo, Item, AdicionalDeductivo, Gasto, ProgramacionSemanal, RegistroAvance) — aunque algunas no se usen hasta días posteriores, el schema se define entero ahora para evitar migraciones fragmentadas
- Primera migración (`prisma migrate dev`)
- Validar conexión real a Supabase

### Bloque 1.3 — Autenticación
- Configurar NextAuth con Credentials Provider
- Hash de contraseñas con bcrypt
- Lógica de login (username + password)
- Middleware de protección de rutas por rol
- Redirección post-login según rol (ADMIN → `(admin)`, SUPERVISOR → `(supervisor)`)
- Logout

### Bloque 1.4 — CRUD Obras (Epic 3 completa)
- Listado de obras en cards (US-3.1)
- Crear obra (US-3.2)
- Editar obra (US-3.3)
- Desactivar/reactivar obra (US-3.4)

### Bloque 1.5 — Seed inicial + validación deploy
- Seed: 1 admin, 1-2 supervisores, 2-3 obras vacías (sin presupuesto todavía)
- Deploy a Vercel, validar login + CRUD de obras funcionando en producción real

### Checklist de cierre del día 1
- [ ] `pnpm install && pnpm dev` corre sin errores en limpio
- [ ] Login funciona con credenciales de seed
- [ ] Redirección por rol funciona
- [ ] CRUD de obras funciona end-to-end (crear, editar, listar, desactivar)
- [ ] Deploy en Vercel accesible públicamente y funcional
- [ ] Estructura de carpetas respeta Screaming Architecture, sin lógica de negocio en `components/`

---

## Día 2 — Presupuesto: títulos, ítems, adicionales/deductivos, gastos

### Objetivo del día
Al final del día 2: dentro de una obra, el admin puede construir el árbol completo de presupuesto (títulos → ítems), aplicar adicionales y deductivos, registrar gastos, y ver la tabla de Teórico/Real/Ejecutado calculando correctamente en los tres niveles (ítem, título, obra).

### Bloque 2.1 — Vista de obra + navegación por pestañas
- Layout de vista de obra con pestañas: Resumen (placeholder por ahora) · Presupuesto · Avance (placeholder por ahora)
- Estructura de pestaña Presupuesto con sus 3 sub-pestañas: Títulos e ítems · Adicionales y deductivos · Gastos

### Bloque 2.2 — Títulos e ítems (Epic 5)
- Crear título (US-5.1)
- Crear ítem dentro de un título (US-5.2) — cálculo y congelamiento de `montoTeorico` al crear
- Tabla de presupuesto con columnas Teórico/Real/Ejecutado a nivel ítem, título y obra (US-5.3) — Real y Ejecutado calculados en tiempo de consulta, no almacenados

### Bloque 2.3 — Adicionales y deductivos (Epic 6)
- Crear deductivo sobre ítem existente (US-6.1) — afecta solo monto, nunca cantidad física
- Crear adicional sobre ítem existente (US-6.2)
- Crear adicional que genera ítem nuevo (US-6.3) — mismo modelo `Item` con `origen = ADICIONAL`, debe quedar disponible para programación y avance en los días siguientes
- Validar que la tabla de Bloque 2.2 refleja correctamente estos ajustes en el cálculo de Real

### Bloque 2.4 — Gastos (Epic 7)
- Registrar gasto contra un ítem (US-7.1) — ítem siempre obligatorio, nunca contra título u obra directamente
- Validar que los gastos alimentan la columna Ejecutado en todos los niveles (US-7.2)

### Bloque 2.5 — Seed de presupuesto
- Completar el seed: la obra "completa" (la que pide el PDF para que todo se vea con datos reales) recibe ahora títulos, ítems, al menos un adicional y un deductivo, y varios gastos en distintas categorías

### Checklist de cierre del día 2
- [ ] Crear título → crear ítem → ver fila en tabla con Teórico calculado correctamente
- [ ] Deductivo reduce el Real del ítem sin tocar su cantidad física
- [ ] Adicional sobre ítem existente aumenta el Real correctamente
- [ ] Adicional que crea ítem nuevo aparece en la tabla con origen identificable
- [ ] Gasto registrado contra un ítem se refleja en Ejecutado a nivel ítem, título y obra
- [ ] Ningún cálculo (Real, Ejecutado) está guardado como columna — todo se computa al consultar
- [ ] Deploy actualizado en Vercel con este avance

---

## Día 3 — Avance: programación semanal, avance real, Gantt automático

### Objetivo del día
Al final del día 3: el admin puede programar cuánta cantidad se avanza por semana para cada ítem, el admin/supervisor puede registrar avance real, y el Gantt se genera automáticamente reflejando programación + avance real, con la línea de semana actual.

### Bloque 3.1 — Cálculo de semanas de obra
- Función pura (`utils/semanas-obra.ts` o equivalente) que calcula el número de semanas entre fecha de inicio y fecha de fin teórica de una obra — pieza base de la que dependen Programación, curvas y Gantt
- Función para determinar en qué número de semana cae la fecha actual (para la línea de "semana actual" del Gantt)

### Bloque 3.2 — Programación semanal (Epic 8, US-8.1)
- Tabla con títulos/ítems a la izquierda (títulos sin input de cantidad, solo agrupadores) y una columna por semana a la derecha
- Input de cantidad programada por ítem/semana
- Persistir en `ProgramacionSemanal`

### Bloque 3.3 — Generación de curva planificada (Epic 8, US-8.2)
- Función pura que, a partir de `ProgramacionSemanal`, genera la serie acumulada semana a semana (física y financiera planificada) — esta función va a ser consumida por las curvas S del día 4, se construye ahora porque depende de programación

### Bloque 3.4 — Avance real (Epic 9)
- Registrar avance: ítem + cantidad + fecha (US-9.1), guarda usuario que lo carga
- Función pura de cálculo de avance físico por ítem (mín(100, cantidad acumulada / cantidad total × 100))
- Generación de curva real acumulada a partir de los registros (US-9.2)
- Resumen desplegable: títulos → ítems → registros de avance (US-9.3)

### Bloque 3.5 — Gantt automático (Epic 10)
- Una fila por título y por ítem
- Barra desde primera a última semana programada del ítem (a partir de Bloque 3.2)
- Relleno de barra según % de avance real del ítem (a partir de Bloque 3.4)
- Línea vertical de semana actual (a partir de Bloque 3.1)
- Validar que un cambio en programación regenera el Gantt sin pasos manuales adicionales

### Bloque 3.6 — Seed de avance
- Completar seed: programación semanal completa para la obra de ejemplo, múltiples registros de avance real con fechas distribuidas en el tiempo (para que la curva real y el Gantt tengan forma visible, no una sola carga)

### Checklist de cierre del día 3
- [ ] Programación semanal persiste y se visualiza correctamente
- [ ] Avance real registrado actualiza el % de avance del ítem correctamente (validar con el ejemplo del PDF: 10+10+10 sobre 100 = 30%)
- [ ] Gantt muestra barras correctas por ítem, relleno proporcional a avance real, línea de semana actual visible
- [ ] Cambiar la programación de un ítem actualiza el Gantt sin acción manual extra
- [ ] Resumen desplegable de avance funciona (títulos → ítems → registros)
- [ ] Deploy actualizado en Vercel con este avance

---

## Día 4 — Curvas S, dashboards, app Supervisor, seed final, pulido y entrega

### Objetivo del día
Al final del día 4: todo el sistema está completo, navegable, con datos de ejemplo cargados en producción, README listo, y validado de punta a punta como lo va a probar el evaluador.

### Bloque 4.1 — Curvas S en pestaña Resumen de obra (Epic 4)
- Curva física: planificado vs real (US-4.2), usando las funciones del Bloque 3.3 y 3.4
- Curva financiera: presupuestado vs ejecutado (US-4.3)
- Indicadores de resumen: avance físico, avance económico, días transcurridos + % tiempo transcurrido, avance por título (US-4.1)

### Bloque 4.2 — Dashboard global admin (Epic 2)
- Cards: obras activas, obras desactivadas, presupuesto total, avance promedio (US-2.1)
- Gráfico de avance físico consolidado (US-2.2)
- Gráfico presupuestado vs ejecutado por obra (US-2.3)

### Bloque 4.3 — App Supervisor (Epic 11)
- Login + redirección ya cubierto en día 1, validar específicamente la vista mobile
- Listado de obras asignadas únicamente (US-11.1) — validar que la restricción está en la capa de datos, no solo ocultando UI
- Carga de avance real desde mobile (US-11.2)
- Carga de gasto desde mobile (US-11.3)
- Validar responsive real en viewport de celular

### Bloque 4.4 — Seed final completo (Epic 12)
- Revisar que el seed cumple el checklist completo del PDF: 1 admin + 1-2 supervisores, 2-3 obras (alguna activa, alguna desactivada), al menos una obra completa con todo (títulos, ítems, programación, avance, gastos variados, 1+ adicional, 1+ deductivo)
- Validar que las curvas, barras y Gantt se ven con datos reales no triviales al abrir la obra de ejemplo

### Bloque 4.5 — QA de punta a punta
- Recorrido completo como Admin: login → dashboard global → obras → crear obra nueva → presupuesto → programación → avance → Gantt → curvas
- Recorrido completo como Supervisor: login → obras asignadas → cargar avance → cargar gasto
- Verificar permisos: supervisor no puede acceder a rutas de admin ni a obras no asignadas (probar manualmente cambiando URLs)
- Verificar que todos los cálculos de las fórmulas del PDF dan resultados consistentes entre sí (Real vs tabla de presupuesto, Ejecutado vs gastos, avance físico vs Gantt)

### Bloque 4.6 — README y entrega
- Instrucciones de instalación local (pnpm install, variables de entorno, migración, seed)
- Variables de entorno documentadas (`.env.example`)
- Comando de seed documentado
- Credenciales de prueba (admin y supervisor) documentadas
- Link de Vercel final validado y accesible

### Bloque 4.7 — Deploy final y buffer
- Deploy final a Vercel con seed corrido en la base de producción
- Última verificación: entrar al link de Vercel desde cero (como lo haría el evaluador) y probar todo sin asumir nada

### Checklist de cierre del día 4 (= checklist de entrega final)
- [ ] Repositorio GitHub accesible
- [ ] README completo (instalación, env vars, seed, credenciales)
- [ ] Link de Vercel funcionando con datos de ejemplo ya cargados
- [ ] Las 12 epics de USER_STORIES.md están implementadas y verificadas
- [ ] Las 7 invariantes de negocio de PROJECT_CONTEXT.md sección 5 se cumplen sin excepción
- [ ] Ningún módulo fuera de alcance (sección 11 de PROJECT_CONTEXT.md) fue agregado
- [ ] Recorrido completo como Admin y como Supervisor sin errores

---

## Cómo usar este documento durante los 4 días

Este documento sirve como referencia de control de avance — al pasarlo de vuelta en cualquier momento, indicar en qué bloque se está parado y qué checklist items están tildados, para validar si el ritmo va acorde al plan o si hace falta reordenar prioridades (recordando siempre la regla de oro: lógica de negocio correcta pesa más que cobertura completa de features — ante falta de tiempo, se prioriza calidad de lo construido sobre cantidad).
