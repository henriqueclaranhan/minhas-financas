# Bugfix: Persistence Boundary Regressions

## Problem
Optional form fields are represented as `undefined` in TypeScript objects. Finance services forwarded those objects directly to Firestore, which rejects unsupported `undefined` field values. The failure affected transaction and planned-expense creation, updates, confirmation-generated transactions, and recurring planned expenses.

The scalability refactor also coupled the three realtime subscriptions in one effect. Increasing either collection limit recreated the user, transaction, and planned-expense listeners, causing unrelated loading states and extra reads. Finally, the recurrence linkage field was declared on the wrong TypeScript entity.

The global 250-document limit was also consumed by dashboard totals, forecasts, invoices, onboarding state, and exports. Those consumers had no pagination control and therefore produced silently incomplete results. Import failures were returned as `false`, but the Settings ViewModel ignored the result and displayed success.

## Acceptance Criteria
- [ ] Every Firestore write boundary removes `undefined` fields without removing `null`, `false`, `0`, or empty arrays.
- [ ] Transaction and planned-expense create/update operations persist sanitized payloads.
- [ ] Confirmation and recurrence transaction writes persist sanitized payloads.
- [ ] Recurrence linkage is typed on `PlannedExpense`, not `Transaction`.
- [ ] User, transaction, and planned-expense listeners have independent lifecycles.
- [ ] User, transaction, and planned-expense subscriptions have independent setup, cleanup, loading, and error lifecycles.
- [ ] Global finance consumers and backups never silently use a truncated collection snapshot.
- [ ] A rejected import is displayed as an error, never as success.
- [ ] Regression tests assert the exact payload passed to every affected Firestore write method.

## Design
- Add a small pure persistence utility that shallowly removes properties whose value is exactly `undefined`.
- Apply it inside services, not forms or ViewModels, so every caller receives the same Firestore-compatible guarantee.
- Split `FinanceContext` subscriptions into three effects with source-specific cleanup and error replacement.
- Remove the unsafe global result cap until period-specific queries and installment competence materialization are available.
- Read exports directly from Firestore in deterministic pages so future view-level query limits cannot truncate backups.
- Keep the existing public context and service APIs stable.

## Non-goals
- Enabling Firestore's global `ignoreUndefinedProperties` option.
- Changing monetary representation or installment behavior.
