## ADDED Requirements

### Requirement: Profile page shows user data
La página de perfil debe mostrar los datos del usuario desde la sesión de NextAuth.

#### Scenario: Loading profile data
- **WHEN** la página de perfil carga
- **THEN** muestra estado de carga mientras obtiene datos

#### Scenario: Profile data loaded successfully
- **WHEN** datos del usuario se cargan correctamente
- **THEN** muestra nombre, email e imagen del usuario

#### Scenario: Profile load fails
- **WHEN** la llamada al API falla
- **THEN** muestra mensaje de error en lugar de crash

### Requirement: Profile page has consistent UI
La página de perfil debe usar estilos consistentes con el resto de la aplicación.

#### Scenario: Profile page uses Tailwind CSS
- **WHEN** se renderiza la página de perfil
- **THEN** usa clases de Tailwind CSS (como otras páginas del proyecto)

### Requirement: Profile page shows avatar
La página de perfil debe mostrar el avatar del usuario si está disponible.

#### Scenario: User has avatar
- **WHEN** el usuario tiene imagen en la sesión
- **THEN** muestra la imagen como avatar

#### Scenario: User has no avatar
- **WHEN** el usuario no tiene imagen en la sesión
- **THEN** muestra un placeholder (icono o inicial)
