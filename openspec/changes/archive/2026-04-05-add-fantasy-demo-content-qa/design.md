## Context

El sistema actual ya permite subir páginas por ZIP y por archivos individuales, procesarlas con `sharp`, convertirlas a WebP, guardarlas en blob storage y mostrarlas en el reader con `Next.js Image`. También existe un fallback de `demo images` para desarrollo cuando un capítulo no tiene páginas reales, pero ese fallback no sirve para validar el flujo completo de QA porque evita el upload, no tensiona el orden real de páginas y no refleja consistencia visual entre escenas.

Los stakeholders principales son:
- Desarrollo y QA, que necesitan una forma reproducible de probar upload, orden, carga y experiencia de lectura.
- Producto y diseño, que necesitan revisar una experiencia cercana a un capítulo real sin depender todavía de contenido editorial definitivo.

La propuesta debe convivir con el comportamiento actual sin reemplazarlo: `demo images` sigue siendo útil para desarrollo rápido, mientras que el nuevo paquete QA sirve para pruebas integrales con material generado externamente.

## Goals / Non-Goals

**Goals:**
- Definir un dataset piloto de fantasía que se sienta como un capítulo real y permita probar paginación, progreso y lectura.
- Estandarizar un prompt pack manual para generar imágenes con estética consistente usando GPT.
- Establecer una estructura operativa reproducible para curación, renombrado, empaquetado ZIP y subida individual.
- Definir criterios claros para validar la experiencia end-to-end con el sistema actual.

**Non-Goals:**
- No automatizar la generación de imágenes desde la aplicación.
- No modificar APIs, base de datos ni componentes del reader en esta fase.
- No poblar el catálogo productivo con contenido permanente.
- No sustituir el sistema actual de `demo images`.

## Decisions

### Decision 1: Dataset corto y narrativo

**Decision**: El primer paquete QA será una sola historia original de fantasía, con un volumen y un capítulo piloto de 12 a 20 páginas.

**Rationale**:
- Es suficiente para probar orden, navegación, persistencia y lectura sin disparar costo o tiempo de generación.
- Obliga a validar continuidad visual entre escenas, algo que los placeholders no cubren.
- Permite iterar rápido antes de escalar a múltiples capítulos.

**Alternatives considered**:
- Dataset grande de varios capítulos: mejor para stress, pero demasiado costoso para la primera iteración.
- Imágenes sueltas sin historia: más rápido, pero no permite evaluar continuidad ni experiencia real de lectura.

### Decision 2: Prompt pack manual en dos capas

**Decision**: La generación se definirá con dos capas de prompts: un prompt maestro de estilo y un prompt específico por página.

**Rationale**:
- Reduce deriva visual entre páginas.
- Permite mantener constantes personajes, vestuario, tono, iluminación y formato.
- Hace más fácil corregir una página defectuosa sin rehacer toda la historia.

**Alternatives considered**:
- Un único prompt por página sin guía común: más flexible, pero mucho menos consistente.
- Automatización total por lotes desde el inicio: atractiva, pero prematura para un primer set QA.

### Decision 3: Separación explícita entre demo visual y QA real

**Decision**: El cambio distinguirá entre el fallback existente de `demo images` y el nuevo paquete QA con imágenes reales generadas fuera de la app.

**Rationale**:
- Evita que el equipo confunda “el reader se ve bien” con “el flujo de upload y lectura está validado”.
- Mantiene el valor del fallback actual para desarrollo rápido.
- Facilita comunicar qué pruebas requieren contenido real subido al blob.

**Alternatives considered**:
- Reemplazar `demo images` por el dataset QA: acopla demasiado el desarrollo diario a contenido pesado y curado.

### Decision 4: Un mismo material, dos vías de carga

**Decision**: El set de imágenes se preparará para ser probado tanto por ZIP como por subida individual.

**Rationale**:
- Ambos caminos ya existen y deben compararse con el mismo contenido.
- Permite verificar diferencias de UX, progreso, cancelación y recuperación.
- Reduce variables al reutilizar exactamente las mismas páginas.

**Alternatives considered**:
- Probar solo ZIP: no cubre cancelación ni progresión por archivo.
- Probar solo individual: no cubre el flujo de reemplazo total del capítulo por lote.

### Decision 5: Convención estricta de nombres y curación

**Decision**: Las páginas QA se nombrarán con numeración fija (`001`, `002`, etc.) y se curarán antes de cualquier upload.

**Rationale**:
- El orden visual es crítico para validar paginación.
- Minimiza errores del extractor ZIP y del flujo secuencial de páginas.
- Facilita repetir pruebas y comparar resultados.

**Alternatives considered**:
- Mantener nombres arbitrarios de la herramienta generativa: introduce ruido innecesario y errores de orden.

## Risks / Trade-offs

- [Inconsistencia visual entre páginas] → Mitigar con prompt maestro, ficha fija de personajes y revisión manual antes de empaquetar.
- [Imágenes demasiado pesadas o con resolución no apta] → Mitigar definiendo rango objetivo de salida y checklist de curación previa al upload.
- [Confusión entre contenido QA y contenido del catálogo] → Mitigar usando serie/capítulo claramente etiquetados como “QA” o “Demo interna”.
- [Falsa sensación de cobertura] → Mitigar definiendo un checklist de validación que obligue a probar ZIP, individual, lectura móvil y desktop.
- [Costo de regeneración] → Mitigar comenzando con un piloto corto y solo escalar cuando el prompt pack quede estable.

## Migration Plan

1. Crear el paquete documental del capítulo piloto: sinopsis, reparto, guía visual y lista de páginas.
2. Generar el primer lote de imágenes usando el prompt pack.
3. Curar el lote: descartar páginas inconsistentes, renombrar y preparar carpeta + ZIP.
4. Crear o reutilizar una serie/capítulo QA en ambiente de desarrollo.
5. Ejecutar pruebas con el flujo ZIP.
6. Repetir pruebas con el flujo individual usando el mismo material.
7. Registrar hallazgos sobre orden, carga, errores, cancelación y lectura.

**Rollback strategy**:
- Si el paquete QA no funciona, el sistema actual sigue operando con `demo images` y con cualquier contenido manual existente.
- Si una prueba ensucia datos, el cleanup puede limitarse al capítulo QA y sus blobs asociados.

## Open Questions

1. Si el primer piloto funciona, ¿la siguiente iteración debe escalar a varios capítulos o a una sola historia más larga?
2. ¿Queremos que el paquete QA incluya también portada y metadata de serie, o solo páginas internas del capítulo?
3. ¿La evaluación visual final la hará solo desarrollo/QA o también se quiere revisión editorial del estilo?
