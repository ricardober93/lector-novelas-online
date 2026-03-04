## ADDED Requirements

### Requirement: Fetcher handles non-OK responses
El fetcher debe manejar respuestas con status no-ok (4xx, 5xx) y convertir respuestas HTML en errores JSON significativos.

#### Scenario: Server returns 401
- **WHEN** el servidor retorna 401
- **THEN** el fetcher lanza error con mensaje del servidor o "Unauthorized"

#### Scenario: Server returns 500 HTML error
- **WHEN** el servidor retorna 500 con HTML (no JSON)
- **THEN** el fetcher lanza error genérico "Error del servidor" sin hacer crash

#### Scenario: Server returns valid JSON with error field
- **WHEN** el servidor retorna { error: "mensaje" } con status no-ok
- **THEN** el fetcher lanza error con ese mensaje

### Requirement: Fetcher simplifies client code
El fetcher debe permitir al cliente calling código sin try-catch extenso.

#### Scenario: Simple fetch call
- **WHEN** cliente llama fetcher(url)
- **THEN** retorna datos directamente o lanza error

#### Scenario: Fetch with options
- **WHEN** cliente llama fetcher(url, options)
- **THEN** funciona igual que fetch con opciones
