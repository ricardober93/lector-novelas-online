## Context

El componente Navigation.tsx actualmente muestra:
- Email del usuario logueado
- Enlace a Panel de creador (solo si role === "CREATOR")
- Enlace a Panel de admin (solo si role === "ADMIN")
- Botón de cerrar sesión

Falta enlace al perfil del usuario y los botones de creador/admin podrían mostrarse de forma unificada.

## Goals / Non-Goals

**Goals:**
- Agregar enlace al perfil del usuario en la barra de navegación
- Unificar la lógica para mostrar opciones de creador/admin usando OR para usuarios con ambos roles

**Non-Goals:**
- No se creará un dropdown/menú desplegable
- No se modificará la lógica de autenticación

## Decisions

1. **Enlace a perfil**: Se agregará un Link a `/profile` con el texto "Perfil" antes de los botones de creador/admin.
   
2. **Unificación de permisos**: La condición `(session.user?.role === "CREATOR" || session.user?.role === "ADMIN")` permitirá mostrar un único botón "Administración" que dirija a `/creator` para creadores y `/admin` para admins.

## Risks / Trade-offs

- [Riesgo] El usuario podría no tener acceso a la ruta si su rol cambió → Mitigación: Las páginas ya tienen su propia verificación de rol

## Migration Plan

1. Modificar `src/components/Navigation.tsx` para agregar enlace a perfil
2. Unificar las condiciones de CREATOR y ADMIN
3. Verificar que la navegación funciona correctamente
