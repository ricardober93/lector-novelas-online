## ADDED Requirements

### Requirement: GET /api/user returns user profile data
El endpoint GET /api/user debe retornar los datos del usuario autenticado desde la sesión de NextAuth en formato JSON válido.

#### Scenario: Authenticated user fetches profile
- **WHEN** usuario autenticado hace GET a /api/user
- **THEN** retorna JSON con { name, email, image }

#### Scenario: Unauthenticated user fetches profile
- **WHEN** usuario no autenticado hace GET a /api/user
- **THEN** retorna error 401 con { error: "No autorizado" }

### Requirement: PUT /api/user handles profile update
El endpoint PUT /api/user debe manejar actualización de perfil y retornar JSON válido.

#### Scenario: Authenticated user updates profile
- **WHEN** usuario autenticado hace PUT a /api/user con datos
- **THEN** retorna { success: true }

#### Scenario: Unauthenticated user updates profile
- **WHEN** usuario no autenticado hace PUT a /api/user
- **THEN** retorna error 401

### Requirement: API returns valid JSON
El API debe siempre retornar JSON válido, nunca HTML.

#### Scenario: Endpoint not found returns JSON
- **WHEN** se hace request a endpoint inexistente
- **THEN** retorna JSON con { error: "Not found" } y status 404 (no HTML)
