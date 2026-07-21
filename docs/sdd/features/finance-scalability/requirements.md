# Requirements: Finance Data Scalability

## Feature Overview
Keep finance data correct and responsive as a user's transaction history grows and when operations execute concurrently. Monetary values remain stored in the existing `amount` field for this iteration.

## User Stories
- As a user, I want confirming a planned expense to create exactly one transaction even if the action is submitted more than once.
- As a user, I want large valid backups to import and large histories to be deleted without exceeding Firestore write limits.
- As a user, I want malformed backups rejected before any data is written.
- As a user, I want finance screens to finish loading only after all required sources respond and to expose subscription failures.
- As a user, I want period views to avoid expanding installments that cannot intersect the selected period.

## Acceptance Criteria
- [ ] Planned expense confirmation checks `pending` status inside a Firestore transaction.
- [ ] Confirmation uses deterministic idempotency keys for the generated transaction and next recurrence.
- [ ] Imports reject oversized JSON, invalid fields, invalid dates, unknown enum values, unsafe document IDs, and out-of-range installments.
- [ ] Import and deletion writes are committed in chunks below the Firestore batch limit.
- [ ] Imported document IDs never silently overwrite existing documents.
- [ ] Firestore rules validate allowed keys, types, enums, bounds, ownership, and planned-expense status transitions.
- [ ] User, transaction, and planned-expense subscriptions report loading and errors independently.
- [ ] Finance context callbacks and provider value are memoized.
- [ ] Period expansion creates only installments that intersect the requested interval.
- [ ] Firestore subscriptions are ordered and bounded; consumers can request the period they need.
- [ ] Automated tests cover validation, batching, idempotency, period expansion, and security rules where emulator infrastructure is available.

## Out of Scope
- Migrating monetary values from decimal numbers to integer cents.
- Server-side monthly aggregate documents.
- Cross-user financial reporting.
