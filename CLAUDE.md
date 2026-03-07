# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BudgetBuddy is a personal finance management app for students. It uses an envelope budgeting system with expense tracking, budget management, and an educational investment dashboard. The codebase is bilingual (Spanish UI/comments, English code identifiers).

## Architecture

- **Backend**: Laravel 12 (PHP 8.2) with Sanctum auth — `backend/`
- **Database**: MySQL 8.0
- **Proxy**: Nginx reverse proxy as single entry point (port 80)
- **Deployment**: Docker Compose (4 services: nginx, backend, db, phpmyadmin)

All traffic goes through Nginx → backend:8000. The landing page (`/`) is a standalone Blade view (`landing.blade.php`). App pages (desktop, misTarjetas, estadisticas, ajustes, setup) are Blade views with `auth` middleware protection. The `frontend/` directory is legacy code (no longer deployed).

### Blade Architecture
- **Layout**: `layouts/budgetbuddy.blade.php` — shared shell with header, sidebar nav, mobile nav. Uses `@yield('title')`, `@yield('content')`, `@stack('styles')`, `@stack('scripts')`. Includes flash messages (`session('success')`, `$errors`).
- **Components**: `components/app-header.blade.php`, `components/sidebar-nav.blade.php`, `components/mobile-nav.blade.php` — reusable nav with `$active` prop (string: 'desktop', 'estadisticas', 'misTarjetas', 'ajustes') for active state.
- **Pages that extend the layout** (pass `$currentPage` from route/controller):
  - `desktop.blade.php` — Dashboard: cuentas, tarjetas vinculadas, etiquetas, metas. JS: `desktop.js`. Modals: account, card, tag, goal, transfer.
  - `misTarjetas.blade.php` — Gestión de tarjetas + movimientos. JS: `tarjetas.js`. Modals: card, movement.
  - `estadisticas.blade.php` — Dashboard educativo de mercado (ETFs). JS: `api-estadisticas.js` + Chart.js CDN.
  - `ajustes.blade.php` — Perfil de usuario. JS: `backajustes.js`. Served from `ProfileController@show` which passes `$user` and `$currentPage`.
- **Standalone pages** (no layout):
  - `landing.blade.php` — Landing page pública. CSS: `landing.css`. JS: `landing.js`. Carga reviews via API y detecta sesión activa.
  - `setup.blade.php` — Wizard de configuración inicial (4 pasos). JS: `setup.js`. Solo accesible si el usuario no tiene cuentas.
- **Assets**: CSS/JS/images in `backend/public/` (referenced via `{{ asset() }}`). Frontend JS uses `fetch('/api/...')` with absolute paths — works identically from Blade.

### SPA-like Navigation (pjax-nav.js)
`backend/public/js/pjax-nav.js` — Loaded in the layout after all other scripts. Intercepts clicks on sidebar (`.nav-item`) and mobile nav (`.mobile-nav-item`) links. Instead of full page reload, it fetches the target page via `fetch()`, extracts the `<main>` content + page-specific CSS/JS, and swaps them in with a 150ms fade transition. Header and nav components never reload. Handles browser back/forward via `pushState`/`popstate`. Falls back to full navigation on error or non-PJAX routes. Page-specific scripts are cache-busted and re-executed on each navigation.

**Important**: All page JS files use `DOMContentLoaded` for initialization. The pjax-nav.js works around this by creating fresh `<script>` elements with cache-bust querystrings, which triggers re-execution. Do NOT use Turbo Drive — it would break `DOMContentLoaded`-based initialization.

### Key Routes (web.php)
```
GET /              → view('landing') (public landing page)
GET /dashboard     → redirect to /desktop (or /setup if no accounts)
GET /desktop       → view('desktop', ['currentPage' => 'desktop'])
GET /misTarjetas   → view('misTarjetas', ['currentPage' => 'misTarjetas'])
GET /estadisticas  → view('estadisticas', ['currentPage' => 'estadisticas'])
GET /ajustes       → ProfileController@show (passes $user + currentPage='ajustes')
PUT /ajustes       → ProfileController@update
GET /setup         → view('setup') (redirects to /dashboard if user has accounts)
```
All app routes are inside `middleware(['auth', 'verified'])`.

## Common Commands

### Docker (primary development method)

```bash
# Start everything
docker compose up -d --build

# Full restart (when changing nginx config or needing clean state)
docker compose down && docker compose up -d --build

# Clear Laravel caches (after changing routes, views, config)
docker compose exec backend php artisan config:clear && \
docker compose exec backend php artisan route:clear && \
docker compose exec backend php artisan view:clear

# Reset database with seed data
docker compose exec backend php artisan migrate:fresh --seed

# View logs
docker compose logs -f backend
```

### Backend (inside container or local)

```bash
cd backend

# Run tests
composer test                              # clears config + runs PHPUnit
php artisan test                           # run tests directly
php artisan test --filter=TestClassName     # run a single test

# Lint
./vendor/bin/pint                          # Laravel Pint (PSR-12 style fixer)

# Dev server (runs Laravel + queue + logs + Vite concurrently)
composer dev

# One-shot setup
composer setup

# Artisan shortcuts
php artisan migrate                        # run pending migrations
php artisan db:seed                        # seed database
php artisan tinker                         # REPL
```


## Access Points

- App: http://localhost:80
- PHPMyAdmin: http://127.0.0.1:8080 (localhost only)

## Key Domain Concepts

- **Account** — Bank account with IBAN, balance, color. Has a `spendable_balance` virtual attribute (balance minus envelope allocations).
- **Movement** — Transaction with types: `gasto` (expense), `ingreso` (income), `traspaso` (transfer). Belongs to an account, optionally to a card and envelope. Has N:M relationship with Tags via `movement_tag` pivot table.
- **Envelope** — Budget category (envelope method). Has `allocated_amount` and `target_amount`.
- **Card** — Payment card linked to an account.
- **Tag** — Color-coded labels for categorizing movements.

## API Structure

All routes in `backend/routes/api.php`. Public routes use `throttle:30,1`, private routes use `web + auth + throttle:60,1` (Sanctum cookie-based auth).

Key endpoints: `/api/accounts`, `/api/movements`, `/api/cards`, `/api/envelopes`, `/api/tags`, `/api/stocks/quote` (Alpha Vantage proxy), `/api/reviews` (public).

ProfileController@show returns JSON when `$request->wantsJson()` (API mode) or the Blade view when accessed via browser. Do NOT send `X-Requested-With: XMLHttpRequest` header from pjax-nav.js fetch calls — it would trigger JSON mode instead of HTML.

## Environment Setup

- Copy `backend/.env.example` → `backend/.env` (the docker-entrypoint.sh does this automatically)
- Copy `.env.docker.example` → `.env.docker` for MySQL credentials
- `ALPHAVANTAGE_API_KEY` in backend `.env` for stock quotes
- `SANCTUM_STATEFUL_DOMAINS` must match the app domain

## Nginx Routing (nginx/default.conf)

Nginx is a simple reverse proxy — all traffic (`location /`) goes to `backend:8000`. Security headers, gzip, and dotfile blocking are configured in the single server block.

**Important**: After changing `nginx/default.conf`, you must restart nginx: `docker compose restart nginx` or do a full `docker compose down && docker compose up -d --build`.

## File Organization

```
backend/
  public/
    css/          ← landing.css, backstyle.css, backajustes.css, desktop.css, tarjetas.css,
                    api-estadisticas.css, notification.css, setup.css, invoices-modal.css
    js/           ← landing.js, formatters.js, notifications.js, desktop.js, tarjetas.js,
                    api-estadisticas.js, setup.js, backajustes.js, pjax-nav.js, invoices-modal.js
    images/       ← logo_budget.png, logo_budget_expand.png, logo.png, card chip.png, visa.png, etc.
    video/        ← Video-budgetbuddy.mp4, subtitulos_es.vtt
  resources/views/
    layouts/budgetbuddy.blade.php
    components/{app-header, sidebar-nav, mobile-nav}.blade.php
    {landing, desktop, misTarjetas, estadisticas, ajustes, setup}.blade.php
  routes/
    web.php       ← Page routes (auth-protected + landing public)
    api.php       ← API routes (Sanctum)
```

## Recent Changes Log

`borrame.txt` in project root contains a detailed changelog of migrations.
