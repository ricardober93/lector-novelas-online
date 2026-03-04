## ADDED Requirements

### Requirement: Navigation shows profile link
La barra de navegación debe incluir un enlace al perfil del usuario cuando está autenticado.

#### Scenario: Authenticated user sees profile link
- **WHEN** el usuario está autenticado (sesión activa)
- **THEN** se muestra un enlace "Perfil" que dirige a /profile

#### Scenario: Unauthenticated user does not see profile link
- **WHEN** el usuario no está autenticado
- **THEN** no se muestra el enlace a perfil
