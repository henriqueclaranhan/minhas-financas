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
- [ ] Add Firebase Emulator rule tests when the repository adopts Firebase CLI test infrastructure.
- [ ] Materialize installment competence metadata/documents before replacing complete global listeners with strict monthly Firestore queries.

## Persistence regression audit
- [x] Sanitize optional values at every finance write boundary.
- [x] Correct recurrence linkage typing.
- [x] Isolate realtime listener lifecycles by source.
- [x] Add exact-payload and persistence regression tests.
- [x] Remove unsafe global truncation and make exports independently paginated.
- [x] Propagate import failure state to Settings.
