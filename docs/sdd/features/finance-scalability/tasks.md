# Tasks: Finance Data Scalability

- [x] 1. Make planned-expense processing transactional and idempotent.
- [x] 2. Add strict backup validation and collision detection.
- [x] 3. Chunk imports and paginate full-history deletion.
- [x] 4. Add collection-specific Firestore validation rules.
- [x] 5. Add ordered subscriptions with independent loading and error callbacks.
- [x] 6. Add period-aware installment expansion.
- [x] 7. Track loading/errors independently and memoize `FinanceContext`.
- [x] 8. Update database schema and run test, lint, and build verification.

## Follow-up
- [x] 9. Add deterministic competence-entry materialization to transaction create, update, delete, confirmation, and import paths.
- [x] 10. Add versioned resumable backfill and compatibility switching for existing data.
- [x] 11. Add indexed temporal competence queries and shared one-pass aggregation.
- [x] 12. Replace transaction-table full history with cursor-based IntersectionObserver lazy loading.
- [x] 13. Replace duplicate dashboard/report calculations with shared aggregates.
- [x] 14. Add observable resumable import jobs and translated progress UI.
- [x] 15. Add Firebase Emulator configuration and security-rule integration tests.
- [x] 16. Update schema/index documentation and run full verification.

## Persistence regression audit
- [x] Sanitize optional values at every finance write boundary.
- [x] Correct recurrence linkage typing.
- [x] Isolate realtime listener lifecycles by source.
- [x] Add exact-payload and persistence regression tests.
- [x] Remove unsafe global truncation and make exports independently paginated.
- [x] Propagate import failure state to Settings.
- [x] Paginate the Planning list while limiting its global listener to active plans.
