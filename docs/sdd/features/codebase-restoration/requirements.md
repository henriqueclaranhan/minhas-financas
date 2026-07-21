# Codebase Restoration Requirements

## Goal

Restore maintainability without changing user-facing finance behavior.

## Requirements

1. Persisted finance values must use the canonical domain constants from `FinanceEnums`.
2. Files, exports, functions, imports, state, and unexplained commented code with no production consumer must be removed.
3. Page ViewModels must mutate finance data through `FinanceContext` only.
4. Repeated modal, form-field, date-filter, and long-press behavior must be shared.
5. Public APIs and UI modes must use narrow types and shared constants instead of `any` or repeated string literals.
6. The project must build and its tests must pass after each independently committed restoration phase.

## Acceptance Criteria

- No mixed-case or translated value is written for transaction type, payment method, or planned-expense status.
- Removed code has no production import or runtime reference.
- Views remain presentation-only and ViewModels keep page behavior.
- Shared UI remains localized and follows the existing responsive patterns.
- ESLint warnings identified by the audit are resolved.
- Each restoration phase is represented by a separate conventional commit.
