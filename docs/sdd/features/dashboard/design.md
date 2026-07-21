# Design: Dashboard Page

## 1. Overview
- **Purpose:** Provide a high-level summary of the user's financial health, displaying current balances, recent transactions, and simple charts.
- **Route:** `/` (when authenticated)

## 2. Architecture (MVVM)
### 2.1 View (`DashboardPage.tsx`)
- **Components:** Summary Cards (Income, Expense, Balance), Recent Transactions List, Expense by Category Chart with category icons in its legend and tooltip.
- **Layout:** Grid layout with widgets.
- **Summary navigation:** Every summary card is a semantic link with the shared top-right chevron. Balance and income open Transactions, expenses open `/expenses/breakdown`, and the current invoice opens Invoices. The chevron alone communicates navigation without supplementary action copy.

### 2.2 ViewModel (`useDashboardViewModel.ts`)
- **State:** Total income, total expenses, balance, recent transactions array, chart data, loading status.
- **Actions:** `fetchDashboardData`.

### 2.3 Model
- **Entities:** `Transaction`
- **Services:** Firestore queries to aggregate recent transactions and calculate totals.

## 3. i18n
- **Requirements:** Dashboard titles, card labels (e.g., "Total Balance"), chart tooltips, and empty states must use `useLocale`.
