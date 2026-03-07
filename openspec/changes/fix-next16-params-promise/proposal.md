## Why

En Next.js 16, los `params` de las rutas dinámicas ahora son **Promises** por defecto como parte del nuevo modelo de renderizado parcial. El código actual accede directamente a `params.id` sin desempaquetar la Promise, causando errores de consola y comportamiento incorrecto.

Error actual:
```
A param property was accessed directly with `params.id`. 
`params` is a Promise and must be unwrapped with `React.use()` 
before accessing its properties.
```

## What Changes

- Actualizar todos los componentes de página con rutas dinámicas para usar `React.use()` con los params
- Cambiar el tipo de `params: { id: string }` a `params: Promise<{ id: string }>`
- Desempaquetar los params antes de usarlos

## Capabilities

### New Capabilities
- (ninguno - es un fix de compatibilidad)

### Modified Capabilities
- `route-params-handling`: Actualizar manejo de params en rutas dinámicas para Next.js 16

## Impact

### Frontend
- `src/app/series/[id]/page.tsx` - Cambiar tipo y uso de params
- `src/app/read/[id]/page.tsx` - Cambiar tipo y uso de params
- `src/app/creator/chapters/[id]/page.tsx` - Cambiar tipo y uso de params
- `src/app/creator/volumes/[id]/page.tsx` - Cambiar tipo y uso de params
- `src/app/creator/series/[id]/page.tsx` - Cambiar tipo y uso de params

### Backend
- (ninguno - cambios solo en componentes cliente)
