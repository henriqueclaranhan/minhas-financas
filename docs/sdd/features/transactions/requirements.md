# Requirements: Transactions

## Feature Overview
Management of financial transactions (incomes and expenses).

## User Stories
- As a User, I want to add a new transaction with date, amount, description, and category.
- As a User, I want to list and filter my transactions by date and category.

## Acceptance Criteria
- [x] Form to create and edit transactions.
- [x] Table/List view of all transactions.
- [x] Filtering capabilities by date range and category.
- [x] Ability to delete a transaction.\n
- [x] Period totals use the same installment competence rules as the dashboard: credit expenses start in the next month, including single-installment purchases, while boleto expenses start in the current month.
- [x] Income and expense summary cards show both totals for the active detailed filters regardless of the selected type tab.
- [x] Date filtering supports Month, Year, and custom Period independently from search, category, and payment method filters.
- [x] The history list shows each persisted transaction exactly once, using its original transaction date and total amount.
- [x] Installment purchases remain a single history row with their installment count; monthly installment rows belong to invoice and projection experiences.
- [x] Period income and expense summary cards keep the existing competence calculation, including next-month credit and current-month boleto offsets.
- [x] The page explains that history rows use transaction date while summary totals use installment competence.
- [x] The period expense summary links to an explanatory breakdown while preserving the active temporal filter in the URL.
