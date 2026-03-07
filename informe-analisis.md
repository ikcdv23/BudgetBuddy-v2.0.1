# Informe de Análisis y Correcciones — BudgetBuddy

**Fecha:** 2026-03-07
**Alcance:** Análisis completo del proyecto (backend, frontend, vistas, config)

---

## 1. Causa raíz del problema de navegación

Al navegar entre páginas (Desktop, Mis Tarjetas, Estadísticas, Ajustes), **los datos no se recargaban**. La página cambiaba visualmente pero quedaba vacía o con spinners infinitos.

### Diagnóstico

El sistema de navegación SPA-like (`pjax-nav.js`) intercepta clicks en la sidebar/mobile nav, hace `fetch` de la nueva página, reemplaza el `<main>` y carga los scripts de la página destino creando elementos `<script>` nuevos con cache-bust.

**El problema:** Los 4 scripts de página usaban `document.addEventListener("DOMContentLoaded", ...)` para inicializarse. Este evento **solo dispara una vez** en la vida del documento — cuando el DOM se parsea inicialmente. Cuando `pjax-nav.js` carga un script dinámicamente, `DOMContentLoaded` ya disparó hace rato, así que los callbacks de inicialización **nunca se ejecutan**.

| Archivo | Qué estaba dentro de DOMContentLoaded | Consecuencia |
|---------|---------------------------------------|--------------|
| `desktop.js:1550` | `loadAccountsFromServer()`, `loadUserProfile()`, `loadGoalsFromServer()`, `loadTagsFromServer()`, `initializeDragAndDrop()` | Dashboard sin datos al navegar desde otra página |
| `tarjetas.js:3` | **TODO el archivo** (1160 líneas) | Página completamente inerte vía PJAX |
| `api-estadisticas.js:92` | `createAllCharts()`, `setupTimeButtons()`, `loadUserProfile()`, `cargarTiempolrun()`, `actualizarPreciosHibrido()` | Gráficos y precios nunca cargan vía PJAX |
| `backajustes.js:1` | **TODO el archivo** (68 líneas) | Botones de editar perfil, logout y modales no funcionan vía PJAX |

### Bug secundario: conflicto de `const` entre páginas

`desktop.js` y `api-estadisticas.js` declaraban `const userAvatarTop` a nivel global (fuera de cualquier función). Cuando PJAX navegaba de una página a la otra, el segundo script intentaba redeclarar la misma constante, causando:

```
SyntaxError: Identifier 'userAvatarTop' has already been declared
```

Esto bloqueaba la ejecución completa del script destino.

---

## 2. Correcciones aplicadas

### 2.1 desktop.js

- Envuelto todo el archivo en un **IIFE** `(function() { ... })();` para aislar el scope y evitar conflictos de `const`/`let` con otros scripts
- Reemplazado el bloque `DOMContentLoaded` (línea 1550) por ejecución directa inmediata
- Expuestas las funciones usadas desde `onclick` inline en el HTML vía `window`:
  - `window.openGoalModal`
  - `window.loadGoalsFromServer`
  - `window.openAddCardModal`

### 2.2 tarjetas.js

- Cambiado el wrapper `document.addEventListener('DOMContentLoaded', function () {` por IIFE `(function () {`
- Cambiado el cierre `});` por `})();` para ejecución inmediata
- `window.openCardModal` ya estaba expuesto (sin cambios)

### 2.3 api-estadisticas.js

- Envuelto todo el archivo en IIFE `(function() { ... })();`
- Reemplazado el bloque `DOMContentLoaded` por función auto-ejecutable `async`
- **Eliminado bug:** `await updateAvatarUI()` se llamaba sin argumentos (la función requiere `fullName`). Era redundante porque `loadUserProfile()` ya llama a `updateAvatarUI(user.name)` internamente

### 2.4 backajustes.js

- Cambiado `document.addEventListener('DOMContentLoaded', function() {` por `(function() {`
- Cambiado cierre `});` por `})();`

### Verificación

Los 4 archivos pasan validación de sintaxis con `node -c`.

---

## 3. Otros problemas detectados (no corregidos)

El análisis completo reveló problemas adicionales que no están relacionados con la navegación pero conviene documentar:

### Críticos

| # | Archivo | Línea | Problema |
|---|---------|-------|----------|
| 1 | `AccountController.php` | 72, 80, 96 | Type hints `account` en minúscula en `show()`, `edit()`, `destroy()` — debería ser `Account` (PascalCase) tras el rename del modelo |
| 2 | `AccountController.php` | 60 | Campo `country_code` no existe en validación, ni en migración, ni en `$fillable` — siempre produce `null` |
| 3 | `routes/api.php` | 36 | Ruta `POST /api/logout` apunta a `ProfileController::logout()` que **no existe** — produce error 500 |

### Altos

| # | Archivo | Línea | Problema |
|---|---------|-------|----------|
| 4 | `ProfileController@update` | 35-45 | El formulario de ajustes envía `email` pero el controlador ni lo valida ni lo guarda — cambios de email se pierden silenciosamente |
| 5 | `desktop.js` | 46 | `userAvatarTop.innerHTML = ...` sin null check — crash si `.user-avatar-top` no existe |
| 6 | `tarjetas.js` | 1079 | Mismo problema de null check en avatar |
| 7 | `api-estadisticas.js` | 35 | Mismo problema de null check en avatar |
| 8 | `setup.js` | 29-30 | `user.name.split(" ")` sin null check — crash si `name` es null |
| 9 | `setup.js` | 89 | Endpoint `fetch("/profile")` incorrecto — la ruta no existe, debería ser `/ajustes` o `/api/user` |
| 10 | `tarjetas.js` | 170 | Header `X-Requested-With: XMLHttpRequest` puede activar JSON mode en ProfileController cuando debería recibir HTML |
| 11 | Migración movements | 6 | `use PHPUnit\Framework\Constraint\Constraint` — import sin usar |

### Medios

| # | Archivo | Problema |
|---|---------|----------|
| 12 | `notifications.js:210` | Crea un `<style>` nuevo cada vez que se llama `showNotification()` — acumula nodos en el DOM |
| 13 | `desktop.js`, `tarjetas.js` | Event listeners no se limpian con navegación PJAX — posible memory leak gradual |
| 14 | `AccountController.php:58` | `$validated['iban'] ?? null` innecesario (`iban` es `required`) |
| 15 | Varios archivos | Comentarios en ucraniano mezclados con español/inglés — inconsistencia de idioma |

### Estado correcto (sin problemas)

- Modelos Eloquent y relaciones (Account, Movement, Card, Envelope, Tag, Profile, Review)
- Migraciones y `$fillable` sincronizados
- Foreign keys con cascade/set null correctos
- Tabla pivot `movement_tag` (N:M) bien implementada
- Vistas Blade (sintaxis, extends, push, yield)
- Layout `budgetbuddy.blade.php` + componentes (header, sidebar, mobile-nav)
- Docker Compose (5 servicios correctamente configurados)
- Nginx routing (grupos A, B, assets, default)
- `pjax-nav.js` (lógica de fetch, swap, CSS/JS replacement, CSRF update, nav active state)
- Sanctum auth + CSRF token management
- `docker-entrypoint.sh` (env copy, key generation, migration)

---

## 4. Archivos modificados

```
backend/public/js/desktop.js         — IIFE + ejecución directa + window exports
backend/public/js/tarjetas.js        — IIFE reemplazando DOMContentLoaded
backend/public/js/api-estadisticas.js — IIFE + ejecución directa + fix updateAvatarUI bug
backend/public/js/backajustes.js     — IIFE reemplazando DOMContentLoaded
```
