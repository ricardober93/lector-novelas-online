# Fix Next.js 16 Params Promise

## Problem

Next.js 16 introduced a breaking change where route `params` are now Promises by default. The current code directly accesses `params.id` without unwrapping the Promise, causing console errors:

```
A param property was accessed directly with `params.id`. 
`params` is a Promise and must be unwrapped with `React.use()` 
before accessing its properties.
```

## Solution

Update all dynamic route pages to:
1. Import `use` from `"react"`
2. Change params type to `Promise<{ id: string }>`
3. Unwrap params with `const { id } = use(params)`
4. Use `id` directly instead of `params.id`

## Files Affected

- `src/app/series/[id]/page.tsx`
- `src/app/read/[id]/page.tsx`
- `src/app/creator/chapters/[id]/page.tsx`
- `src/app/creator/volumes/[id]/page.tsx`
- `src/app/creator/series/[id]/page.tsx`

## Artifacts

- **[proposal.md](./proposal.md)** - Why this change is needed
- **[design.md](./design.md)** - Architecture and design decisions
- **[tasks.md](./tasks.md)** - Implementation checklist
- **[specs/route-params-handling/spec.md](./specs/route-params-handling/spec.md)** - Technical specification

## Status

🟡 **Ready for implementation**

## Estimated Effort

30-45 minutes (7 tasks across 5 files)

## Risk Level

**Low** - Simple refactor with well-defined pattern
