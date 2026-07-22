# Contextual Expense Breakdowns Design

## Overview

The existing expense breakdown becomes a reusable context-aware view. Route wrappers select one of three variants: confirmed expenses, planning, or forecast. Each variant supplies translated page metadata, two reconciled groups, entry metadata, a parent fallback, and an authoritative total.

## Routes

- `/expenses/breakdown`: direct payments and credit-card installments.
- `/planned/breakdown`: one-time and recurring pending planned expenses.
- `/forecast/breakdown`: confirmed and included planned projected expenses.

All routes serialize Month, Year, or custom Period state. Planning additionally serializes search, category, and payment method. Forecast serializes planned-income and planned-expense toggles so returning to the parent preserves its context.

## Model and ViewModel

- Extend the breakdown path utilities to accept a destination and optional context parameters.
- Keep confirmed-expense aggregation in the existing competence-entry path.
- Build planning entries with `expandPlannedExpenses`, including all recurring occurrences through the selected period, the pending-status rule, and the same detailed-filter predicates as the Planning summary.
- Calculate forecast confirmed and total monthly series through `calculateProjections`; their expense difference is the planned group, preventing a duplicated projection formula.
- Expose a shared `ExpenseBreakdownGroup` model consumed by the existing responsive view.

## View

The shared page retains its reconciliation card and two-ledger composition. Icons, labels, descriptions, entry metadata, empty copy, and accent colors vary by context. The visual signature remains reconciliation: two sources visibly add up to the exact parent-card total. Source-card navigation chevrons follow the established top-right placement on desktop and compact mobile cards. Ledger dates use a content-sized column and remain on one line at every breakpoint.

## Verification

- Unit-test route serialization for all contexts.
- Test planning and forecast reconciliation with representative data.
- Test the three source-page links and context-specific headings.
- Run lint, full tests, and the production build.
