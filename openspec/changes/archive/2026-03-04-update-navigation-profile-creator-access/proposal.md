## Why

La navegación actual no incluye un enlace al perfil del usuario, lo cual es una funcionalidad esperada. Además, los enlaces a Panel de creador y Panel de admin se muestran por separado cuando podrían consolidarse para usuarios con ambos roles.

## What Changes

- Agregar enlace al perfil del usuario en la barra de navegación
- Unificar los enlaces de creador y admin en un solo menú o sección de "Administración"
- Permitir acceso a la sección de creación de contenido para usuarios con rol CREATOR o ADMIN

## Capabilities

### New Capabilities
- `navigation-profile-link`: Agregar enlace al perfil del usuario en el componente Navigation
- `navigation-unified-admin-access`: Unificar acceso a panel de creador/admin para usuarios con permisos

### Modified Capabilities
- (ninguno - solo cambios de implementación)

## Impact

- Frontend: `src/components/Navigation.tsx` - agregar enlace a perfil y unificar menús de creador/admin
