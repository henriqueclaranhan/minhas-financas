# Design: Finance Data Scalability

## Data Access
- `TransactionService` and `PlannedExpenseService` own bounded, ordered Firestore queries and structured listener errors.
- Period queries include source documents whose installment competence can intersect the requested range. Expansion then discards installments outside that range.
- Data-sync deletion queries Firestore directly in pages instead of depending on the currently loaded client window.

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
5. Return a structured summary; no write starts until validation and collision checks finish.

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

## Compatibility
Existing documents continue to use `amount: number`. Optional legacy fields documented by current TypeScript models remain accepted where needed.
