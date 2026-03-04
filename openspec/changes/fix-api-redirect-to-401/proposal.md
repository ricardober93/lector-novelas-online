## Why

El middleware actualmente redirige a /login (307 Temporary Redirect) cuando el usuario no está autenticado y accede a rutas API protegidas como /api/user. Los fetch requests no siguen redirects a páginas HTML correctamente, causando errores en el cliente.

## What Changes

- Modificar el middleware para retornar 401 en lugar de redirect para rutas API
- Las rutas /api/* deben retornar JSON con error 401, no redirigir a páginas HTML

## Capabilities

### New Capabilities
- (ninguno - es un fix de middleware)

### Modified Capabilities
- `middleware-auth`: Cambiar redirect a 401 para rutas API

## Impact

- Backend: `src/middleware.ts` - modificar lógica de autenticación para APIs
