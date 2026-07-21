# Requirements: Expense Breakdown

## Feature Overview

Explain exactly which competence entries compose the expense total for a selected period without duplicating the transaction history.

## User Stories

- As a user, I want to open the expense total and understand why it has that value.
- As a user, I want to distinguish payments made in the period from credit-card installments charged in the period.
- As a user, I want the breakdown to retain the period I selected on the transactions page.

## Acceptance Criteria

- [x] The dashboard monthly expense card opens the breakdown for the current month.
- [x] The transactions expense summary opens the breakdown with the active Month, Year, or custom Period selection.
- [x] The breakdown total exactly matches the existing competence-based expense calculation.
- [x] The page separates non-credit payments from credit-card installments and shows a subtotal for each group.
- [x] Credit entries show the installment position, total installments, original purchase date, and competence amount.
- [x] The page presents the reconciliation `total = payments + credit installments` without introducing a second history mode.
- [x] The period can be adjusted with the shared temporal filter.
- [x] The page is a nested destination with back navigation on desktop and mobile.
- [x] Empty periods explain that no expenses compose the selected total.
- [x] All copy is translated into every supported locale, and the layout works on mobile and desktop.
- [x] On mobile, both ledger sections are expandable and initially open; on desktop, they remain always open.
- [x] Mobile ledger expansion and collapse use brief motion and respect the reduced-motion preference.
- [x] Back navigation returns to the previous in-app page or falls back to Home when no prior in-app history entry exists.

## Business Rules

- Only persisted expense transactions participate; pending planned expenses do not.
- Credit expenses begin in the month after the original purchase, including one-installment purchases.
- Boleto installments begin in the original transaction month.
- The sum of every rendered competence entry must equal the displayed period total.
