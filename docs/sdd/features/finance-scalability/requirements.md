# Requirements: Finance Data Scalability

## Feature Overview
Keep finance data correct and responsive as a user's transaction history grows and when operations execute concurrently. Monetary values remain stored in the existing `amount` field for this iteration.

## User Stories
- As a user, I want confirming a planned expense to create exactly one transaction even if the action is submitted more than once.
- As a user, I want large valid backups to import and large histories to be deleted without exceeding Firestore write limits.
- As a user, I want malformed backups rejected before any data is written.
- As a user, I want finance screens to finish loading only after all required sources respond and to expose subscription failures.
- As a user, I want period views to avoid expanding installments that cannot intersect the selected period.
- As a user, I want finance screens to load only the periods they need while preserving exact totals.
- As a user, I want transaction tables to load more rows as I scroll instead of using numbered or arrow pagination.
- As a user, I want long imports to expose progress and resume safely after a transient failure.

## Acceptance Criteria
- [x] Planned expense confirmation checks `pending` status inside a Firestore transaction.
- [x] Confirmation uses deterministic idempotency keys for the generated transaction and next recurrence.
- [x] Imports reject oversized JSON, invalid fields, invalid dates, unknown enum values, unsafe document IDs, and out-of-range installments.
- [x] Import and deletion writes are committed in chunks below the Firestore batch limit.
- [x] Imported document IDs never silently overwrite existing documents.
- [x] Firestore rules validate allowed keys, types, enums, bounds, ownership, and planned-expense status transitions.
- [x] User, transaction, and planned-expense subscriptions report loading and errors independently.
- [x] Finance context callbacks and provider value are memoized.
- [x] Period expansion creates only installments that intersect the requested interval.
- [x] Each transaction write materializes deterministic competence entries that preserve credit and boleto offsets.
- [x] Existing users receive a versioned, resumable backfill before period queries become authoritative.
- [x] Period totals and breakdowns query competence entries by ISO date and reconcile with the source transaction.
- [x] Transaction history uses cursor-based lazy loading with no numbered or arrow pagination.
- [x] Shared aggregation utilities perform one pass per requested dataset and are reused by dashboard consumers.
- [x] Import jobs expose validated, writing, completed, and failed states with processed/total progress and a resumable checkpoint.
- [x] Firestore Emulator tests exercise ownership, validation, immutable derived fields, and allowed status transitions.
- [x] Automated tests cover validation, batching, idempotency, period expansion, lazy loading, materialization, import resumption, and security rules.

## Out of Scope
- Migrating monetary values from decimal numbers to integer cents.
- Cross-user financial reporting.
