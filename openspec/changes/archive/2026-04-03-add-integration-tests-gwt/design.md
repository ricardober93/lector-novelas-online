## Context

La aplicación tiene varios recorridos críticos ya implementados:

- Login con magic link
- Protección de rutas para creador, lector y admin
- Home con series populares y continuar leyendo
- Lector con navegación entre capítulos
- Panel de creador para series, volúmenes y capítulos
- Panel de administración para moderación

La falta no es funcionalidad, sino una capa de verificación de integración que conecte UI, API y sesión con casos explícitos.

## Design Goals

1. Capturar los flujos críticos en casos G/W/T concretos
2. Mantener los casos pequeños, atómicos y fáciles de mapear a Playwright
3. Separar escenarios felices de escenarios de error
4. Hacer visible la cobertura por área funcional
5. Evitar dependencias implícitas entre casos

## Proposed Structure

La suite viviría conceptualmente en:

```text
tests/
  integration/
    cases/
      auth/
      home/
      reader/
      creator/
      admin/
      responsive/
```

Cada caso debería documentar:

- `Given`: estado inicial y datos necesarios
- `When`: acción del usuario o evento del sistema
- `Then`: resultado observable en UI, URL, sesión o respuesta de red
- `Data`: usuario, rol, serie, capítulo o estado requerido
- `Checks`: qué se valida de forma explícita

## Coverage Strategy

### Auth
- Login por magic link
- Validación de email inválido
- Acceso sin sesión a rutas protegidas
- Cierre de sesión

### Home / Discovery
- Home carga series
- Continuar leyendo aparece solo cuando hay historial
- Navegación a detalle de serie

### Reader
- Carga de capítulo
- Navegación a capítulo anterior y siguiente
- Persistencia de progreso
- Acceso denegado cuando falta sesión

### Creator
- Acceso al panel según rol
- Crear volumen desde detalle de serie
- Acceder a capítulo y flujo de subida

### Admin
- Acceso al panel solo para admin
- Ver cola de moderación
- Aprobar o rechazar contenido

### Responsive
- Barra de navegación en desktop
- Drawer en mobile
- Estados visibles sin clipping ni overlays rotos

## Notes

No se propone implementar todavía los tests reales ni ejecutar Playwright en esta fase. Esta propuesta define el catálogo exacto que luego se podrá convertir en automatización y validación interactiva.

