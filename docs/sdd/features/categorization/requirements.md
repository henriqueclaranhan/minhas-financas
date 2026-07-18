# Requirements: Transaction Categorization

## Feature Overview
Users need the ability to categorize their expenses and incomes to better track their financial habits.

## User Stories
- As a User, I want to assign a category to my expenses, so that I know where my money is going.
- As a User, I want to assign a category to my incomes, so that I know the sources of my money.
- As a User, I want to see the category of each transaction in the transaction list.

## Acceptance Criteria
- [ ] The `Transaction` and `PlannedExpense` models should include an optional `category` field.
- [ ] The `TransactionForm` should have a dropdown to select a category.
- [ ] The available categories in the dropdown should depend on whether the transaction is an income or an expense.
- [ ] Categories must be translated using the i18n system.
- [ ] The transaction list/table should display the category of the transaction.

## Edge Cases / Constraints
- Existing transactions without a category should not break the UI.
- The categories dropdown should be responsive and accessible.
