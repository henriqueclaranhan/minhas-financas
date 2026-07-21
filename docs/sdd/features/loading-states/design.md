# Design: Financial Loading Skeletons

## Architecture
- `FinanceContentSkeleton` is a shared presentational component with dashboard, list, report, and detail structures.
- ViewModels combine `FinanceContext.isLoading`, competence-query loading, and first history-page loading as appropriate.
- Pages short-circuit after `PageHeader` while authoritative content is unknown. Controls, calculated values, charts, tables, and empty states render only after loading.

## Visual behavior
- Placeholder geometry approximates the final cards and rows to reduce layout shift.
- A restrained opacity pulse uses existing surface tokens; no semantic financial color is shown before data exists.
- `prefers-reduced-motion: reduce` disables the pulse.

## Accessibility
- The skeleton wrapper is a polite status region with localized loading text.
- Decorative placeholder shapes are hidden from assistive technology.
