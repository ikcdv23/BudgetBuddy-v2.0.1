# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions

### Workflow
- Mantener este CLAUDE.md actualizado tras cada cambio importante
- Antes de cada commit, actualizar `Update_history.txt` con las novedades de la versión
- NO incluir "Co-Authored-By" en mensajes de commit
- Usar SemVer: PATCH (bugfixes), MINOR (nuevas features compatibles), MAJOR (breaking changes). Versión actual: **v2.4.0**
- Sincronizar también el badge de versión en `README.md` cuando cambie la versión
- Documentar cambios grandes en `borrame.txt` (archivo temporal de referencia)

### Idioma y estilo
- UI y comentarios en español, identificadores de código en inglés
- Responder siempre en español

## Project Overview

BudgetBuddy es una app web de gestión financiera para estudiantes. Implementa el sistema de sobres (envelope budgeting) con tracking de gastos/ingresos, gestión de tarjetas con datos cifrados, y un dashboard educativo de mercado con ETFs.

## Architecture

- **Backend**: Laravel 12 (PHP 8.2) with Sanctum auth — `backend/`
- **Database**: MySQL 8.0
- **Proxy**: Nginx reverse proxy as single entry point (port 80)
- **Deployment**: Docker Compose (4 services: nginx, backend, db, phpmyadmin)

All traffic goes through Nginx → backend:8000. The landing page (`/`) is a standalone Blade view (`landing.blade.php`). App pages (desktop, misTarjetas, estadisticas, ajustes, setup) are Blade views with `auth` middleware protection.

### Blade Architecture
- **Layout**: `layouts/budgetbuddy.blade.php` — shared shell with header, sidebar nav, mobile nav. Uses `@yield('title')`, `@yield('content')`, `@stack('styles')`, `@stack('scripts')`. Includes flash messages (`session('success')`, `$errors`).
- **Components**: `components/app-header.blade.php`, `components/sidebar-nav.blade.php`, `components/mobile-nav.blade.php` — reusable nav with `$active` prop (string: 'desktop', 'estadisticas', 'misTarjetas', 'ajustes') for active state.
- **Pages that extend the layout** (pass `$currentPage` from route/controller):
  - `desktop.blade.php` — Dashboard: cuentas, tarjetas vinculadas, etiquetas, metas. JS: `desktop.js`. Modals: account, card, tag, goal, transfer.
  - `misTarjetas.blade.php` — Gestión de tarjetas + movimientos. Layout 2-col: carrusel tarjetas (izq) + panel detalle con stats (der). Transacciones full-width debajo. JS: `tarjetas.js` (incluye `renderCardDetail()` con campos sensibles reveal). Modals: card (número completo obligatorio, CVC obligatorio), movement, reveal password (verificación contraseña para ver datos sensibles cifrados).
  - `estadisticas.blade.php` — Dashboard educativo de mercado (ETFs). JS: `api-estadisticas.js` + Chart.js CDN.
  - `ajustes.blade.php` — Hub de ajustes con 2 tabs ("Mi Perfil" | "Configuración"). Tab Perfil: hero con avatar clickable (8 presets + subida foto), form datos personales (nombre, email, teléfono), seguridad (cambiar contraseña). Tab Config: selector moneda (EUR/USD/GBP), selector tema (light/dark/auto), gestión datos (exportar CSV, eliminar cuenta), planes futuros (gamificación, notificaciones), about, cerrar sesión. Modales: avatar picker, password change, delete account. JS: `backajustes.js`. CSS: `backajustes.css`. Served from `ProfileController@show` which passes `$user` and `$currentPage`. Datos iniciales vía `window.__ajustesData`.
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
- **Envelope** — Budget category (envelope method). Has `allocated_amount` and `target_amount`. Backend validates that sum of allocations per account doesn't exceed `current_balance`.
- **Card** — Payment card linked to an account. Stores `card_number` (required, 13-19 digits) and `security_code` / CVC (required, exactly 3 digits), both encrypted at rest via Laravel `encrypted` cast. `last_4_digits` se auto-calcula del número completo. Campos sensibles en `$hidden` — nunca se envían en JSON normales. `POST /api/cards/{card}/reveal` con verificación de contraseña para acceder. `has_full_number` y `has_security_code` como boolean appends.
- **Tag** — Color-coded labels for categorizing movements. Per-user (each user has their own tags via `user_id` FK). Unique name constraint per user. Limit: 50 tags per user.

## API Structure

All routes in `backend/routes/api.php`. Public routes use `throttle:30,1`, private routes use `web + auth + throttle:60,1` (Sanctum cookie-based auth).

Key endpoints: `/api/accounts`, `/api/movements`, `/api/cards`, `/api/cards/{card}/reveal` (POST — requires password, returns decrypted card_number + security_code), `/api/envelopes`, `/api/tags`, `/api/stocks/quote` (Alpha Vantage proxy), `/api/reviews` (public), `/api/profile` (GET/PUT), `/api/profile/avatar` (POST — preset string or file upload via FormData), `/api/profile/password` (PUT), `/api/profile/currency` (PUT), `/api/profile/export` (GET — CSV download), `/api/profile/account` (DELETE — requires password). `/api/user` returns user with profile loaded.

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
    css/          ← Compartidos: app-variables.css, app-dark-mode.css, app-layout.css,
                    app-modals.css, app-forms.css, app-utilities.css, notification.css
                    Página: desktop.css, tarjetas.css, backajustes.css,
                    api-estadisticas.css, setup.css, invoices-modal.css
                    Standalone: landing.css
    js/
      core/       ← Módulos compartidos cargados en el layout:
                    formatters.js (auto-formateo inputs: IBAN, phone, digits, card-number)
                    utils.js (getCookie, escapeHTML, formatDate, formatCurrency, parseExpirationDate, showNotification, loadUserProfile)
                    api-client.js (apiRequest: CSRF automático, 401→redirect, 422→validation errors)
                    theme-toggle.js (toggle tema light/dark/auto, localStorage, FOUC prevention)
                    notifications.js (popup campana del header)
      modules/    ← Módulos funcionales reutilizables:
                    drag-drop.js (drag & drop genérico con zona de eliminar)
      (raíz)      ← Scripts de página: landing.js, desktop.js, tarjetas.js,
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

### CSS Architecture
- **Layout** (`budgetbuddy.blade.php`) carga CSS compartidos: `app-variables.css` → `app-dark-mode.css` → `app-layout.css` → `app-modals.css` → `app-forms.css` → `app-utilities.css` → `notification.css` → `@stack('styles')` (page CSS)
- `app-variables.css`: Design tokens `:root` — escala de grises (--gray-50→900), sombras (6 niveles), radios, transiciones, superficies, acentos suaves, spacing. Incluye `@media (prefers-reduced-motion: reduce)`.
- `app-dark-mode.css`: Dark mode via `html[data-theme="dark"]` — sobrescribe variables y estilos de todos los componentes. Toggle manual en header (3 estados: light/dark/auto).
- `app-layout.css`: Body, header (glassmorphism), sidebar (pill indicator), mobile-nav, containers, media queries compartidas
- `app-modals.css`: Sistema `<dialog>` (.tag-modal) usado por desktop y tarjetas. **Nota**: ajustes usa un sistema de modales DIFERENTE (div overlay con header verde)
- `app-forms.css`: Formularios, cards (border-top acento verde + shadow-md), grid, page-header, botones (con :disabled y :focus-visible), selectores de tipo
- `app-utilities.css`: Clases utilitarias (.hidden, .d-flex, .text-danger, .btn-add-circle, .form-row-flex, etc.) + focus-visible global + responsive .form-row-flex collapse (600px)
- **Standalone pages** (`setup.blade.php`) cargan `app-variables.css` + `app-dark-mode.css` + `app-utilities.css` + `app-forms.css` + su CSS propio
- `pjax-nav.js` filtra CSS compartidos (baseStyles incluye app-dark-mode) vs. CSS de página para swap en navegación SPA

### JS Module Architecture
- **Layout** (`budgetbuddy.blade.php`) carga en orden: `core/formatters.js` → `core/utils.js` → `core/api-client.js` → `core/theme-toggle.js` → `core/notifications.js` → `modules/drag-drop.js` → `@stack('scripts')` (page JS) → `pjax-nav.js`
- **Theme toggle**: Script FOUC-prevention inline en `<head>` (antes de CSS) aplica `data-theme` a `<html>`. `theme-toggle.js` maneja el ciclo light→dark→auto→light, persiste en `localStorage('bb-theme')`, escucha cambios OS para modo auto. Botón en header (#theme-toggle-btn) con iconos fa-sun/fa-moon/fa-circle-half-stroke.
- **Standalone pages** (`setup.blade.php`) cargan manualmente los core modules que necesitan antes de su script de página.
- Todos los módulos exportan a `window.*` para compatibilidad con las IIFEs de página.
- `apiRequest(url, method, data)` centraliza: CSRF cookie automático para mutaciones, headers con XSRF-TOKEN, manejo de 401 (redirect login) y 422 (throw con mensajes de validación). No muestra notificación propia — cada caller maneja su UI.
- `initDragAndDrop(config)` acepta selectores + callbacks, reemplaza implementaciones inline en desktop.js y tarjetas.js.

## Changelog Summary

> Historial detallado en `Update_history.txt`. Aquí solo las versiones con resumen breve.

- **v2.4.0** (2026-03-12) — Tags por usuario (user_id FK), validación saldo en sobres, índices compuestos en movements, fix crear múltiples metas
- **v2.3.0** (2026-03-12) — Número completo y CVC cifrados en tarjetas, reveal con contraseña, limpieza de ~80 comentarios ucraniano→español, eliminación código muerto, validación caducidad, timeout PJAX, fix setup wizard, fix importe negativo movimientos, fix botón añadir tarjeta
- **v2.2.1** (2026-03-12) — Rediseño "Mis Tarjetas" (layout 2-col, carrusel, panel detalle con stats)
- **v2.2.0** (2026-03-11) — Dark mode toggle (light/dark/auto), responsive mejorado, mejora estética completa, modularización JS (core/ + modules/), refactorización CSS (-35%)
- **v2.1.0** (2026-03-07) — Migración landing a Blade, eliminación frontend/, navegación SPA-like (pjax-nav.js), accesibilidad, video con subtítulos VTT
- **v2.0.0** — Lanzamiento inicial
