## Why

La página de perfil actual tiene una UI básica con estilos inline y el endpoint `/api/user` no existe, causando errores JSON al intentar cargar el perfil. Además, no hay manejo adecuado de errores cuando la API falla.

## What Changes

- Crear endpoint API `/api/user` para obtener y actualizar datos del usuario
- Mejorar la UI de la página de perfil con diseño consistente al resto de la app
- Agregar manejo de errores robusto (verificar respuesta JSON válida)
- Usar la sesión de NextAuth para obtener datos del usuario

## Capabilities

### New Capabilities
- `user-profile-api`: Endpoint API para obtener/actualizar perfil de usuario
- `profile-page-ui`: Nueva UI mejorada para la página de perfil

### Modified Capabilities
- (ninguno)

## Impact

- Backend: `src/app/api/user/route.ts` - nuevo endpoint
- Frontend: `src/app/profile/page.tsx` - UI mejorada
- Dependencias: next-auth (usar sesión existente)
