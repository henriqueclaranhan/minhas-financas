# Design: Transactions Page

## 1. Overview
- **Purpose:** Allow users to view, filter, add, edit, and delete their financial transactions.
- **Route:** `/transactions`

## 2. Architecture (MVVM)
### 2.1 View (`TransactionsPage.tsx`)
- **Components:** Transaction List/Table, Filters (Date, Category), Add/Edit Modal (`TransactionForm`).
- **Layout:** List view with a header containing actions and filters.

### 2.2 ViewModel (`useTransactionsViewModel.ts`)
- **State:** Transactions list, applied filters, modal visibility, currently editing transaction, loading status.
- **Actions:** `addTransaction`, `updateTransaction`, `deleteTransaction`, `applyFilter`.
- **Period aggregation:** Expand transactions through `expandTransactions` before applying filters and calculating totals. Credit expenses use next-month competence even when they have one installment; boleto expenses use current-month competence for their first installment.

### 2.3 Model
- **Entities:** `Transaction` (id, description, amount, type, date, category, paymentMethod).
- **Services:** Firestore CRUD operations on the `transactions` collection.

## 3. i18n
- **Requirements:** Table headers, filter labels, modal titles, and form fields must be translated using `useLocale`.
