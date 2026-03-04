-## Why
-Quiero habilitar un perfil de usuario donde el usuario pueda ver y editar su información (nombre, avatar, biografía, preferencias de notificaciones).
-Esto mejora la personalización y la experiencia del usuario, aumentando la retención y la satisfacción.

## What Changes
- Crear una interfaz de perfil en el frontend para ver y editar datos de usuario.
- Integrar con la API existente (por ejemplo /api/user) para GET y PUT.
- Añadir validaciones básicas y retroalimentación de estado (cargas, errores, guardado exitoso).
- Ampliar el alcance para incluir URL de avatar y preferencias de notificaciones.
- Añadir un flujo básico de validación y mensajes de estado claros para usuario.

## Scope
- Frontend: página de perfil y componentes asociados.
- Integración con API de usuario existente; no se esperan cambios de backend si la API ya soporta GET/PUT.
- Soporte de avatar vía URL (con preview). Soporte para carga de archivos de avatar se considerará en iteración futura.
- Incluir validaciones básicas y feedback de guardado.

## Goals & Success Criteria
- El usuario puede ver sus datos actuales en la página de perfil.
- El usuario puede editar y guardar cambios; los cambios persisten.
- Se muestran notificaciones/errores claras y no hay regresiones.

## Capabilities
- Ver perfil
- Editar perfil
- Avatar URL (con vista previa) + plan para carga de avatar en el futuro
- Preferencias de notificaciones

## Artifacts
- proposal.md describe el problema y la justificación del cambio.
- Quiero habilitar un perfil de usuario donde el usuario pueda ver y editar su información (nombre, avatar, biografía, preferencias de notificaciones).
- Esto mejora la personalización y la experiencia del usuario, aumentando la retención y la satisfacción.

## What Changes
- Crear una interfaz de perfil en el frontend para ver y editar datos de usuario.
- Integrar con la API existente (por ejemplo /api/user) para GET y PUT.
- Añadir validaciones básicas y retroalimentación de estado (cargas, errores, guardado exitoso).

## Scope
- Frontend: página de perfil y componentes asociados.
- Integración con API de usuario existente; no se esperan cambios de backend si la API ya soporta GET/PUT.

## Goals & Success Criteria
- El usuario puede ver sus datos actuales en la página de perfil.
- El usuario puede editar y guardar cambios; los cambios persisten.
- No se introducen regresiones en otras áreas de la aplicación.

## Capabilities
- Ver perfil
- Editar perfil
- Subir/usar avatar (URL) o carga básica (con implementación futura)

## Artifacts
- proposal.md describe el problema y la justificación del cambio.
