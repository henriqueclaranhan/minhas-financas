# Design: Planned Expenses Page

## 1. Overview
- **Purpose:** Allow users to manage recurring bills and future planned expenses before they occur.
- **Route:** `/planned-expenses`

## 2. Architecture (MVVM)
### 2.1 View (`PlannedExpensesPage.tsx`)
- **Components:** Planned Expenses List/Table, Add/Edit Modal (`PlannedExpenseForm`), Mark as Paid button.
- **Layout:** List view similar to Transactions.

### 2.2 ViewModel (`usePlannedExpensesViewModel.ts`)
- **State:** List of planned expenses, modal visibility, loading status.
- **Actions:** `addPlannedExpense`, `updatePlannedExpense`, `deletePlannedExpense`, `markAsPaid` (which converts it into an actual Transaction).

### 2.3 Model
- **Entities:** `PlannedExpense` (id, description, amount, expectedDate, frequency).
- **Services:** Firestore CRUD on `plannedExpenses`, plus transactional insertion into `transactions` when marked as paid.

## 3. i18n
- **Requirements:** Headers, modal titles, frequency options (e.g., "Monthly", "Weekly"), and alerts must use `useLocale`.
