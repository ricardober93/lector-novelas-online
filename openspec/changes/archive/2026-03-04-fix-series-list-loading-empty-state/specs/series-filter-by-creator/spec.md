## ADDED Requirements

### Requirement: Series can be filtered by creator ID
El endpoint GET /api/series debe soportar el parámetro query `creatorId` para filtrar series por el ID del creador.

#### Scenario: Filter series by creator ID
- **WHEN** se hace una solicitud GET a /api/series?creatorId=abc123
- **THEN** el API retorna solo las series donde series.creatorId = "abc123"

#### Scenario: Filter series without creatorId
- **WHEN** se hace una solicitud GET a /api/series sin parámetro creatorId
- **THEN** el API retorna todas las series (comportamiento existente)

### Requirement: Empty state shows CTA for creator
Cuando no hay series disponibles para mostrar, la interfaz debe mostrar un mensaje claro con un enlace para crear una nueva serie.

#### Scenario: Empty series list on home page
- **WHEN** la página principal carga y no hay series en la base de datos
- **THEN** se muestra un mensaje "No hay series disponibles aún"

#### Scenario: Empty series list on creator page
- **WHEN** el panel de creador carga y el usuario no tiene series
- **THEN** se muestra un mensaje con enlace "Crear mi primera serie" que dirige a /creator/series/new
