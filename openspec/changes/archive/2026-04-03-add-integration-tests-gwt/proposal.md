## Why

El proyecto ya tiene flujos críticos funcionando en la UI, pero la cobertura actual es básicamente unitaria. Eso deja sin protección los recorridos que más riesgo tienen de romperse entre frontend, API, sesión y navegación: login por magic link, protección de rutas, lectura de capítulos, continuidad de progreso, creación de contenido y moderación.

Necesitamos una base de pruebas de integración que describa casos precisos en formato Given / When / Then para que luego puedan convertirse en tests reales de Playwright sin ambigüedad.

## What Changes

- Crear una suite formal de pruebas de integración para los flujos principales del producto
- Organizar los casos en una carpeta dedicada, por dominio funcional, para que cada caso sea ejecutable y mantenible
- Estandarizar los casos con formato Given / When / Then
- Cubrir escenarios felices, errores previsibles y al menos algunos casos fuera del camino ideal
- Dejar la base preparada para validación manual e iterativa con Playwright Interactive durante la implementación

## Capabilities

### New Capabilities
- `integration-test-catalog`: catálogo mantenible de casos de integración por flujo
- `gwt-case-specs`: casos descriptivos y precisos listos para convertirse en tests ejecutables

### Modified Capabilities
- `authentication-flow-validation`: login, sesión y protección de rutas se validan de forma end-to-end
- `reader-flow-validation`: home, detalle de serie, lector y navegación entre capítulos quedan cubiertos
- `creator-admin-flow-validation`: panel de creador y panel de administración quedan cubiertos por casos de integración

## Impact

- Nueva carpeta de casos propuesta: `tests/integration/cases/`
- Casos por dominio: auth, home/discovery, reader, creator, admin, responsive
- Más claridad para convertir requisitos funcionales en tests automatizables
- Menor riesgo de regresiones en auth, navegación y lectura
- Base compartida para QA manual, tests automatizados y CI futuro

