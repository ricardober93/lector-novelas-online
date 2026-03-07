# Spec: API Contracts

## Overview

Especificación para establecer contratos consistentes entre APIs y frontend, eliminando ambigüedades sobre qué datos incluye cada endpoint.

## Technical Requirements

### TR-1: Consistent Data Inclusion

**Requisito**: Las APIs deben incluir todos los datos relacionados que el frontend necesita para renderizar la vista completa.

**Rationale**: Evitar N+1 queries del frontend y asegurar que los datos están disponibles cuando se necesitan.

**Acceptance Criteria**:
- [ ] `/api/series/[id]` incluye `volumes.chapters` con todos los campos necesarios
- [ ] La estructura de respuesta es predecible y documentada
- [ ] No hay discrepancias entre listado y detalle

**Implementation Details**:

```typescript
// /api/series/[id]/route.ts

const series = await prisma.series.findUnique({
  where: { id },
  include: {
    creator: {
      select: { id: true, email: true },
    },
    volumes: {
      include: {
        chapters: {
          select: {
            id: true,
            number: true,
            title: true,
            pageCount: true,
            status: true,
          },
          orderBy: { number: "asc" },
        },
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { number: "asc" },
    },
    _count: {
      select: { volumes: true },
    },
  },
});
```

### TR-2: Defensive Array Access

**Requisito**: El frontend debe usar optional chaining (`?.`) y nullish coalescing (`??`) en todos los accesos a arrays de datos.

**Rationale**: Proteger contra cambios en APIs, errores de red, o datos faltantes sin causar crashes.

**Acceptance Criteria**:
- [ ] Todos los `.map()` en arrays de datos usan `?.map()`
- [ ] Todos los `.filter()` en arrays de datos usan `?.filter()`
- [ ] Todos los `.length` en arrays de datos usan `?.length`
- [ ] Fallback a `[]` cuando el array es undefined/null

**Implementation Pattern**:

```typescript
// ✅ Correcto - Defensive
{data.items?.map((item) => (
  <Item key={item.id} {...item} />
))}

{data.items?.filter((item) => item.active) ?? []}

{data.items?.length ?? 0}

// ❌ Incorrecto - No defensive
{data.items.map((item) => (  // ← Crashes if undefined
  <Item key={item.id} {...item} />
))}
```

### TR-3: Null/Undefined Handling

**Requisito**: Siempre proporcionar valores por defecto para datos opcionales.

**Rationale**: Evitar errores de "Cannot read properties of undefined" en runtime.

**Acceptance Criteria**:
- [ ] Props que pueden ser null/undefined tienen valores por defecto
- [ ] SWR data siempre tiene fallback: `data?.field || defaultValue`
- [ ] Componentes manejan estado de loading y error

**Implementation Pattern**:

```typescript
// ✅ Correcto
const series = seriesData?.series || null;
const volumes = series?.volumes ?? [];
const chapters = volume?.chapters ?? [];

// ❌ Incorrecto
const series = seriesData.series;  // ← Crashes if seriesData is undefined
```

## API Contracts

### Contract: GET /api/series/[id]

**Purpose**: Obtener detalles de una serie específica con volúmenes y chapters.

**Response Structure**:
```typescript
{
  series: {
    id: string;
    title: string;
    description: string | null;
    type: "MANGA" | "COMIC" | "WEBTOON";
    isAdult: boolean;
    status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    coverImage: string | null;
    creator: {
      id: string;
      email: string;
    };
    volumes: Array<{
      id: string;
      number: number;
      title: string | null;
      chapters: Array<{
        id: string;
        number: number;
        title: string | null;
        pageCount: number;
        status: "PENDING" | "APPROVED" | "REJECTED";
      }>;
      _count: {
        chapters: number;
      };
    }>;
    _count: {
      volumes: number;
    };
  };
}
```

**Error Responses**:
- `404`: Serie no encontrada
- `500`: Error interno del servidor

### Contract: GET /api/volumes/[id]

**Purpose**: Obtener detalles de un volumen específico con chapters.

**Response Structure**:
```typescript
{
  volume: {
    id: string;
    number: number;
    title: string | null;
    series: {
      id: string;
      title: string;
      creatorId: string;
    };
    chapters: Array<{
      id: string;
      number: number;
      title: string | null;
      pageCount: number;
      status: "PENDING" | "APPROVED" | "REJECTED";
    }>;
    _count: {
      chapters: number;
    };
  };
}
```

### Contract: GET /api/chapters/[id]

**Purpose**: Obtener detalles de un capítulo específico con pages.

**Response Structure**:
```typescript
{
  chapter: {
    id: string;
    number: number;
    title: string | null;
    pageCount: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    volume: {
      id: string;
      number: number;
      series: {
        id: string;
        title: string;
        isAdult: boolean;
        creatorId: string;
      };
    };
    pages: Array<{
      id: string;
      number: number;
      imageUrl: string;
      width: number | null;
      height: number | null;
    }>;
    _count: {
      pages: number;
    };
  };
}
```

## Edge Cases

### EC-1: Empty Arrays

**Scenario**: Una serie sin volúmenes, o un volumen sin chapters.

**Expected Behavior**:
- API retorna `volumes: []` o `chapters: []`
- Frontend muestra mensaje "No hay X aún"
- Sin errores ni crashes

**Implementation**:
```typescript
{series.volumes?.length === 0 ? (
  <EmptyState message="No hay volúmenes aún" />
) : (
  <VolumeList volumes={series.volumes ?? []} />
)}
```

### EC-2: API Error or Timeout

**Scenario**: La API falla o tarda demasiado en responder.

**Expected Behavior**:
- SWR retorna error
- Frontend muestra estado de error
- Botón de retry disponible
- Sin crashes

**Implementation**:
```typescript
const { data, error, isLoading } = useSWR('/api/series/[id]', fetcher);

if (error) return <ErrorState onRetry={() => mutate()} />;
if (isLoading) return <LoadingState />;
if (!data?.series) return <NotFoundState />;
```

### EC-3: Partial Data

**Scenario**: La API retorna datos incompletos (algunos campos undefined).

**Expected Behavior**:
- Optional chaining previene crashes
- UI se renderiza con datos disponibles
- Campos faltantes muestran valores por defecto

**Implementation**:
```typescript
<h1>{series?.title ?? "Sin título"}</h1>
<p>{series?.description ?? "Sin descripción"}</p>
```

## Testing Strategy

### Unit Tests

- [ ] Test API response structure
- [ ] Test empty arrays handling
- [ ] Test null/undefined handling

### Integration Tests

- [ ] Test full data flow from API to UI
- [ ] Test error states
- [ ] Test loading states

### Manual Testing Checklist

- [ ] Navigate to `/series/[id]` with data
- [ ] Navigate to `/series/[id]` with empty volumes
- [ ] Navigate to `/series/[id]` with volumes but no chapters
- [ ] Test with slow network (devtools throttling)
- [ ] Test with API returning 500 error
- [ ] Verify no console errors in all scenarios

## Migration Checklist

For each API endpoint:
- [ ] Verify current response structure
- [ ] Update Prisma query to include all needed relations
- [ ] Test API response manually
- [ ] Document expected response structure

For each frontend component:
- [ ] Identify all array accesses
- [ ] Add optional chaining (`?.`)
- [ ] Add nullish coalescing (`??`) with fallbacks
- [ ] Test with missing data scenarios
- [ ] Verify no crashes

## References

- [TypeScript Optional Chaining](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#optional-chaining)
- [Nullish Coalescing](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries)
