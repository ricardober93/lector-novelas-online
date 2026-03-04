-## Context
-Actualmente los usuarios no tienen una página dedicada para ver/editar su perfil.
-Requisitos existentes de autenticación y manejo de usuarios deben permanecer intactos.

## Goals / Non-Goals

**Goals:**
- Añadir UX de perfil con lectura/escritura de datos del usuario.
- Integración limpia con la API de usuario existente.
- Soporte de avatar URL y notificaciones básicas.

**Non-Goals:**
- Cambios en la lógica de negocio de autenticación o permisos avanzados.
- Carga de archivos de avatar en esta iteración (planificado como mejora posterior).

## Decisions
- Crear una ruta /profile en el frontend y componentes de formulario reutilizables.
- Usar la API GET /api/user para cargar datos y PUT /api/user para guardar cambios.
- Validación básica en cliente y mensajes de estado claros.
- Migrar a soporte de avatar mediante URL y vista previa; carga de archivos será añadida luego.

## Risks / Trade-offs
- Riesgo de gestión de estado duplicado si UI actualiza datos en varios lugares. Mitigación: mantener estado local para el formulario y sincronizar con la API al guardar.

## Migration Plan
- Sin migraciones de base de datos necesarias si la API ya expone endpoints para usuario.

## Open Questions
- ¿Soportaremos carga de avatar por archivos o solo URL? (Planificado para iteración 2)

- Actualmente los usuarios no tienen una página dedicada para ver/editar su perfil.
- Requisitos existentes de autenticación y manejo de usuarios deben permanecer intactos.

## Goals / Non-Goals

**Goals:**
- Añadir UX de perfil con lectura/escritura de datos del usuario.
- Integración limpia con la API de usuario existente.

**Non-Goals:**
- Cambios en la lógica de negocio de autenticación o permisos avanzados.

## Decisions
- Crear una ruta /profile en el frontend y componentes de formulario reutilizables.
- Usar la API GET /api/user para cargar datos y PUT /api/user para guardar cambios.
- Validación básica en cliente y mensajes de estado claros.

## Risks / Trade-offs
- Riesgo de gestión de estado duplicado si UI actualiza datos en varios lugares. Mitigación: mantener estado local para el formulario y sincronizar con la API al guardar.

## Migration Plan
- Sin migraciones de base de datos necesarias si la API ya expone endpoints para usuario.

## Open Questions
- ¿Soportaremos carga de avatar por archivos o solo URL? (placeholder para futuras iteraciones)
