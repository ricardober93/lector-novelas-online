## Why

El proyecto ya tiene un flujo funcional para subir páginas e imágenes y un reader con fallback a demo images, pero hoy no existe un paquete de contenido de prueba realista para validar la experiencia completa de punta a punta. Esto limita la capacidad de probar paginación, carga al blob storage, consistencia visual, orden de páginas y lectura con material cercano a un capítulo real.

## What Changes

- Definir un paquete formal de contenido QA basado en una historia corta original de fantasía.
- Estandarizar un prompt pack manual para generar imágenes consistentes con GPT antes de subirlas a la plataforma.
- Establecer una estructura reproducible para capítulo piloto, numeración de páginas, empaquetado ZIP y carga individual.
- Documentar un flujo de validación que reutilice el sistema actual de upload y reader para probar experiencia real, no solo placeholders.
- Separar explícitamente el uso de demo images de desarrollo del uso de contenido QA curado con imágenes reales generadas externamente.

## Capabilities

### New Capabilities
- `qa-fantasy-story-pack`: Define un capítulo piloto de fantasía con narrativa, páginas objetivo y prompts consistentes para generación de imágenes de prueba.
- `qa-content-validation-flow`: Define el flujo reproducible para curar, empaquetar, subir y validar contenido QA usando los endpoints y componentes existentes.

### Modified Capabilities
- None.

## Impact

- Reutiliza el reader existente en `src/components/reader/ChapterReader.tsx` para validar lectura con páginas reales.
- Reutiliza los flujos de subida en `src/components/upload/ChapterUploadForm.tsx`, `src/app/api/chapters/[id]/upload/route.ts` y `src/app/api/pages/route.ts`.
- Convive con el fallback actual de `src/lib/demoImages.ts`, pero aclara que ese mecanismo no sustituye el dataset QA.
- No requiere cambios inmediatos de dependencias ni APIs; el alcance inicial es de especificación, dataset de prueba y procedimiento operativo.
