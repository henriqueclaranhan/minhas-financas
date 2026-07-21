# Requirements: Expense Categories Analysis

## Feature Overview

Provide a dedicated screen where users can understand how confirmed expenses are distributed across categories for one month or a custom date range. The default view is the current month.

## User Stories

- As a user, I want to see my expenses grouped by category for the current month so that I can quickly understand where my money is going.
- As a user, I want to select another month so that I can review a previous or future accounting period.
- As a user, I want to select an inclusive custom date range so that I can analyze spending across a period that is not limited to one calendar month.
- As a user, I want to open the detailed analysis from the Home expense-category card so that I can move naturally from the summary to the full breakdown.

## Acceptance Criteria

- [x] The application provides an authenticated `/categories` route.
- [x] The Home expense-category card provides a translated action that opens `/categories`.
- [x] The page is available from the desktop sidebar and the mobile drawer as a secondary destination.
- [x] The page uses `PageHeader`, shows Back on mobile, and does not show Back on desktop while the sidebar is visible.
- [x] The default filter mode is Month, with the current month selected.
- [x] Month mode allows selecting a month and year.
- [x] Range mode allows selecting an inclusive start date and end date.
- [x] The end date cannot precede the start date.
- [x] Results include confirmed expense transactions only; income and planned expenses are excluded.
- [x] Transactions without a category are grouped under `categories.others`.
- [x] Results show the total expense amount, a category chart, and a ranked category breakdown.
- [x] The summary uses three responsive cards for total expenses, the highest-spending category, and the second-highest-spending category.
- [x] Every category entry shows its icon, translated name, amount, and percentage of the filtered total.
- [x] The page has a translated empty state when the selected period has no expenses.
- [x] Currency, dates, category names, controls, and messages follow the active locale.
- [x] The layout is usable on mobile and desktop without horizontal page scrolling.

## Accounting Rules

- Non-installment expenses are included on their transaction date.
- Credit-card installments are allocated starting in the month after purchase, using offset `i`.
- Parceled Boleto installments are allocated starting in the purchase month, using offset `i - 1`.
- Each installment uses the transaction day shifted by its accounting month; normal date-library overflow behavior applies.
- A generated installment is included when its allocated date falls inside the selected inclusive interval.

## Edge Cases and Constraints

- A zero total must produce `0%` values rather than division errors.
- Unknown category keys must remain readable through the existing fallback icon and translation behavior.
- Invalid or incomplete custom ranges must not be applied.
- The dashboard current-month summary and the detailed page must use the same aggregation utility to prevent different totals.
- No Firestore schema or service change is required; aggregation uses transactions already available in `FinanceContext`.
