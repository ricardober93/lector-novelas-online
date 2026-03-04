## ADDED Requirements

### Requirement: API routes return 401 JSON
Las rutas API protegidas deben retornar 401 con JSON cuando el usuario no está autenticado.

#### Scenario: Unauthenticated request to /api/user
- **WHEN** usuario no autenticado hace GET /api/user
- **THEN** retorna { error: "No autorizado" } con status 401 (no redirect)

#### Scenario: Unauthenticated request to /api/series
- **WHEN** usuario no autenticado hace GET /api/series
- **THEN** retorna { error: "No autorizado" } con status 401

### Requirement: Page routes still redirect to login
Las rutas de páginas (/creator, /read) siguen redirigiendo a /login.

#### Scenario: Unauthenticated request to /creator
- **WHEN** usuario no autenticado accede a /creator
- **THEN** redirige a /login (comportamiento existente)
