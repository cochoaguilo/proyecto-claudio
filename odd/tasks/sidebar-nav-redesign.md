# Sidebar nav redesign

## Objective
Give the app a more modern look (soft color palette, generous spacing) and replace
the current button-row navigation with a fixed left sidebar that links to the
three entity screens (Transactions, Quote, Positions) and stays visible on every
route, including inside the table screens.

## Problem / why
User request: current home page just has three buttons to the tables; no
persistent navigation once inside a table screen. Visual style is the default
shadcn black/white/gray theme. User wants a softer, modern palette and a fixed
left-hand nav (collapsible) shared across all screens.

## Scope
- `src/app/globals.css` — soften the color palette (light + dark) via existing
  OKLCH CSS variables; keep shadcn variable contract intact.
- New `src/components/layout/app-sidebar.tsx` (+ small nav-item pieces as
  needed) — left, fixed/persistent sidebar with links to `/`, `/transactions`,
  `/quote`, `/positions`, active-route highlighting, collapsible on toggle.
- `src/app/layout.tsx` — mount the sidebar once at the root so it persists
  across every route without each page re-implementing it.
- `src/app/page.tsx` — drop the now-redundant button row; keep the hero copy.
- No changes to CSV adapters, schemas, or table/column logic.

## Constraints
- No new heavy UI framework; reuse existing deps (`lucide-react`, `radix-ui`,
  Tailwind v4, existing shadcn CSS variable contract in `globals.css`).
- Must not break the existing DataTable/CsvUploader flow.
- Keep changes to layout/styling — not a design-system rewrite.

## Tasks
- [ ] T1 — Soften color palette in `globals.css` (light + dark OKLCH values,
      keep variable names untouched).
- [ ] T2 — Build `AppSidebar` (fixed left, collapsible, active-link
      highlighting, Home/Transactions/Quote/Positions).
- [ ] T3 — Mount sidebar in `layout.tsx` so it's present on every route with a
      responsive content area (left margin/padding for the sidebar width).
- [ ] T4 — Simplify `src/app/page.tsx` hero now that nav lives in the sidebar.
- [ ] T5 — Verify: `npm run lint`, `npm run build`, and a visual check of all
      three routes in a running dev server.

## Delivery
Single feature branch (`feat/tanstack-tables-csv-scaffold`, already checked
out). Small enough to stay as one work-unit commit; no chaining needed.

## TDD
No test framework configured for UI/styling in this repo. Verification is
functional: lint + build + manual browser check, not automated tests.

## Progress
- Created 2026-09-29. Not started.
