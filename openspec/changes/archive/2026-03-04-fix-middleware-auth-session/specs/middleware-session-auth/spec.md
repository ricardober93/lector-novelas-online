## ADDED Requirements

### Requirement: Middleware uses getAuth for session validation
El middleware debe usar getAuth de next-auth/react para validar la sesión del usuario.

#### Scenario: Authenticated user accesses /api/user
- **WHEN** usuario autenticado hace request a /api/user
- **THEN** getAuth retorna la sesión y el request pasa

#### Scenario: Unauthenticated user accesses /api/user
- **WHEN** usuario sin sesión hace request a /api/user
- **THEN** retorna 401 con { error: "No autorizado" }

### Requirement: User with session can access profile
El usuario con sesión activa debe poder ver su perfil y datos.

#### Scenario: Logged user loads profile page
- **WHEN** usuario autenticado accede a /profile
- **THEN** la página carga y muestra los datos del usuario (email, nombre)

### Requirement: Admin role assignment
El usuario ribermudezt@gmail.com debe tener rol ADMIN en la base de datos.

#### Scenario: Admin user exists in database
- **WHEN** se consulta la base de datos
- **THEN** el usuario ribermudezt@gmail.com tiene role = ADMIN
