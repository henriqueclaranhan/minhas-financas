# Design: Financial Loading Skeletons

## Architecture
- `FinanceContentSkeleton` is a shared presentational component with dedicated dashboard, transactions, planning, invoices, forecast, category-analysis, and expense-breakdown structures.
- ViewModels combine `FinanceContext.isLoading`, competence-query loading, and first history-page loading as appropriate.
- Pages short-circuit after `PageHeader` while authoritative content is unknown. Controls, calculated values, charts, tables, and empty states render only after loading.

## Visual behavior
- Placeholder geometry mirrors each page's control order, card count, panel grid, chart height, and row structure to reduce layout shift.
- Skeleton surfaces mirror the real hierarchy: unframed type tabs remain unframed, while search, period, and forecast controls retain their panel backgrounds.
- A restrained opacity pulse uses existing surface tokens; no semantic financial color is shown before data exists.
- `prefers-reduced-motion: reduce` disables the pulse.

## Accessibility
- The skeleton wrapper is a polite status region with localized loading text.
- Decorative placeholder shapes are hidden from assistive technology.
