# Requirements: Financial Loading Skeletons

## Feature Overview
Represent unknown asynchronous financial content with structural skeletons instead of temporary zero values or empty states.

## Acceptance Criteria
- [x] Dashboard, transactions, planning, invoices, forecast, category analysis, and expense breakdown expose loading state from their authoritative data sources.
- [x] Initial loading renders structural placeholders instead of formatted zero values or empty-state copy.
- [x] Real zero values and empty states render normally after loading completes.
- [x] Skeletons use shared tokens, announce loading to assistive technology, and respect reduced-motion preferences.
- [x] Lazy-loaded continuation rows retain their existing compact loading indicator.
- [x] Each covered page receives a dedicated skeleton composition matching its visible element order and responsive layout.
