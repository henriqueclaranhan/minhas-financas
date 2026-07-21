# Design: Finance Data Scalability

## Data Access
- `TransactionService` owns cursor-based original-transaction history queries ordered by `date desc, documentId desc`.
- `CompetenceEntryService` owns deterministic derived entries under `users/{uid}/competenceEntries/{transactionId}--{position}` and interval queries ordered by `competenceDate`.
- Every persisted transaction has one or more competence entries. Credit expenses start at offset `i`; boleto expenses start at `i - 1`; non-installment entries retain the original date.
- `FinanceMigrationService` backfills existing transactions in deterministic pages and records `financeSchemaVersion` plus a cursor on the user document. Consumers keep the compatibility source until migration version 2 completes.
- Period screens query only intersecting competence entries. Transaction history independently lazy-loads source transactions and never feeds aggregate calculations.
- Planned expenses retain their complete source listener because recurring plans can project into an interval from an earlier base date; their table uses incremental rendering to bound DOM work. Backup/delete operations continue to use direct deterministic pagination.
- Data-sync deletion queries Firestore directly in pages instead of depending on the currently loaded client window.
- Data export also reads directly from Firestore in deterministic document-ID pages.

## Aggregation
- `financeAggregationUtils` groups competence entries in a single pass into income, expense, credit, payment-method, category, and monthly buckets.
- Dashboard, Transactions summaries, Expense Breakdown, invoices, and category totals consume the shared aggregate rather than independently expanding the same source transactions.
- Current balance is derived from the initial balance plus competence entries through the current interval; it remains exact and does not depend on the lazy-loaded history window.

## Lazy-loaded history
- The first history page loads automatically.
- An `IntersectionObserver` sentinel requests the next cursor page near the end of the desktop table or mobile card list.
- Loading, retry, exhausted, and empty states are explicit and translated.
- Filter or temporal changes reset the cursor and loaded window. No numbered pages or previous/next arrows are rendered.

## Concurrency and Idempotency
- Confirmation runs in `runTransaction` and reads the planned expense before writing.
- The generated transaction ID is derived from the planned-expense ID (`plannedExpense:<id>:confirmation`) through a Firestore-safe deterministic document ID.
- The next recurring plan also has a deterministic ID. Retries therefore converge on the same documents.
- Only `pending` expenses can transition to `confirmed` or `cancelled` through the client.

## Import Pipeline
1. Enforce a maximum UTF-8 payload size before parsing.
2. Parse JSON and validate the root object and every supported field.
3. Reject duplicate or unsafe IDs and check supplied IDs for collisions.
4. Commit normalized operations in chunks of 400.
5. Create an import job with a deterministic content fingerprint, total operations, and checkpoint.
6. Commit normalized source and competence operations in bounded chunks, updating processed progress after each chunk.
7. Retry transient failures from the last committed checkpoint; a matching file can resume a failed job.
8. Return a structured observable result; no write starts until validation and collision checks finish.

The existing decimal `amount` representation is intentionally preserved.

## Context State
- Loading flags are tracked for user, transactions, and planned expenses.
- Listener errors use a small `FinanceError` contract with source, code, and message.
- Mutations use `useCallback`; the provider value uses `useMemo`.
- A retry generation recreates failed listeners.

## Security Rules
- `/users/{uid}` validates only supported profile finance fields affected by this feature.
- Transaction and planned-expense subcollections validate exact field sets, primitive types, enum values, date shape, string lengths, and installment bounds.
- Update rules preserve immutable linkage fields and enforce allowed status transitions.
- Competence entries are owner-only, validate deterministic source linkage and accounting fields, and cannot change their `transactionId`, position, or source date after creation.
- Import-job documents are owner-only and validate status/progress bounds.

## Indexes and emulator
- Composite indexes support history cursors and competence range ordering.
- `firebase.json` configures Firestore rules, indexes, and local emulator ports.
- Rule tests use `@firebase/rules-unit-testing` against the Firestore Emulator and are isolated from unit-test mocks.

## Compatibility
Existing documents continue to use `amount: number`. Optional legacy fields documented by current TypeScript models remain accepted where needed.
