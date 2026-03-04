## Why

El middleware usa `getToken()` de next-auth/jwt para obtener el token, pero la sesión está configurada con estrategia "database". Esto causa que el middleware no pueda leer el token correctamente y retorna 401 aunque el usuario tenga sesión activa. Además, el usuario ribermudezt@gmail.com necesita rol ADMIN.

## What Changes

- Modificar el middleware para usar la sesión de next-auth en lugar de getToken
- Agregar soporte para leer el token JWT cuando la sesión es de base de datos
- Actualizar el rol del usuario ribermudezt@gmail.com a ADMIN en la base de datos

## Capabilities

### New Capabilities
- `middleware-session-auth`: Fixed authentication using next-auth session

### Modified Capabilities
- (ninguno)

## Impact

- Backend: `src/middleware.ts` - usar `getAuth` de next-auth/react o ajustar lógica
- Database: Actualizar rol de usuario a ADMIN
