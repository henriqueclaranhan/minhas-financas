# Design: Planned Expenses Page

## 1. Overview
- **Purpose:** Allow users to manage recurring bills and future planned expenses before they occur.
- **Route:** `/planned-expenses`

## 2. Architecture (MVVM)
### 2.1 View (`PlannedExpensesPage.tsx`)
- **Components:** Planned Expenses List/Table, Add/Edit Modal (`PlannedExpenseForm`), Mark as Paid button.
- **Layout:** List view similar to Transactions.
- **Filter context:** A dedicated temporal panel supports Month, Year, and custom Period. Type and search remain next to the table, while category and payment method share the detailed filter modal. Active detailed filters appear as translated labels.
- **Summary order:** Type tabs and the detailed filter panel render above the summary cards. Type tabs affect the list only; summary totals retain both planning types while respecting detailed filters.
- **Spacing:** The filter-to-summary and summary-to-table gaps both use `--spacing-lg`.
- **Control order:** Type tabs remain at the top; temporal filtering precedes summaries, while search and category filtering sit below the cards next to the table.

### 2.2 ViewModel (`usePlannedExpensesViewModel.ts`)
- **State:** List of planned expenses, modal visibility, loading status.
- **Actions:** `addPlannedExpense`, `updatePlannedExpense`, `deletePlannedExpense`, `markAsPaid` (which converts it into an actual Transaction).
- **Lazy-loaded list:** Source plans are queried in pages of 40 ordered by `dueDate, documentId`. Temporal changes reset the cursor, while the shared intersection sentinel requests subsequent pages. The query widens its lower date boundary by the maximum supported installment horizon, then the existing expansion utility retains only occurrences intersecting the selected period.
- **Exact summaries:** Summary totals continue to use the complete active-plan working set and never depend on the loaded list window.
- **Detailed filters:** Category and payment method keep temporary modal values until Apply, reset together to `all`, persist in `category` and `method` query parameters, and filter both the lazy-loaded list and the complete summary source with logical AND. Payment-method options reuse the same semantic icons as Transactions and the planning form.

### 2.3 Model
- **Entities:** `PlannedExpense` (id, description, amount, expectedDate, frequency).
- **Services:** Firestore CRUD on `plannedExpenses`, plus transactional insertion into `transactions` when marked as paid.
- **Active working set:** The realtime listener includes only `pending` plans, preventing confirmed and cancelled history from growing every projection consumer indefinitely. Processed history remains available to export and direct service queries.

## 3. i18n
- **Requirements:** Headers, modal titles, frequency options (e.g., "Monthly", "Weekly"), and alerts must use `useLocale`.
