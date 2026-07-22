# Contextual Expense Breakdowns Requirements

## User Stories

- As a user, I want the Planning expense summary to open a composition page so I can identify the pending plans behind its total.
- As a user, I want the Forecast expense summary to open a composition page so I can distinguish confirmed and planned amounts in the projection.
- As a user, I want the Categories total card to open the existing expense composition with the same selected period.

## Acceptance Criteria

- The Planning expense summary links to `/planned/breakdown` and preserves the active temporal, search, category, and payment-method context.
- The Planning breakdown reconciles exactly with the source expense card and separates one-time from recurring pending expenses.
- The Forecast expense summary links to `/forecast/breakdown` and preserves the active temporal and projection-toggle context.
- The Forecast breakdown reconciles exactly with the source expense card and separates confirmed from included planned expenses.
- The Categories total card links to `/expenses/breakdown` and preserves its selected month or custom date range.
- Every breakdown uses the shared page anatomy, compact period context, reconciliation summary, responsive ledgers, localized copy, and logical parent fallback.
- Empty groups and empty totals provide contextual guidance.
- Direct navigation to every breakdown route works in production and remains non-indexable.

## Business Rules

- Confirmed expenses use materialized competence entries and the existing Credit/Boleto offsets.
- Planning uses pending expanded planned expenses and the same active detailed filters as its summary card.
- Forecast values come from `calculateProjections`; planned expense inclusion follows the source toggle, and confirmed versus planned values must sum to the displayed forecast expense total.

