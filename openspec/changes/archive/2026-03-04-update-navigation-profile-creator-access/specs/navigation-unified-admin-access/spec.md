## ADDED Requirements

### Requirement: Unified creator/admin access
La barra de navegación debe mostrar un único botón de "Administración" para usuarios con rol CREATOR o ADMIN, permitiendo acceso a las secciones de creación de contenido.

#### Scenario: Creator sees administration link
- **WHEN** el usuario tiene rol CREATOR
- **THEN** se muestra un enlace "Administración" que dirige a /creator

#### Scenario: Admin sees administration link
- **WHEN** el usuario tiene rol ADMIN
- **THEN** se muestra un enlace "Administración" que dirige a /admin

#### Scenario: User with both roles sees single administration link
- **WHEN** el usuario tiene roles CREATOR y ADMIN
- **THEN** se muestra un único enlace "Administración" (no duplicado)

#### Scenario: Regular user does not see administration link
- **WHEN** el usuario no tiene rol CREATOR ni ADMIN
- **THEN** no se muestra el enlace de administración
