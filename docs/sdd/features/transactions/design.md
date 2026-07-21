# Design: Transactions Page

## 1. Overview
- **Purpose:** Allow users to view, filter, add, edit, and delete their financial transactions.
- **Route:** `/transactions`

## 2. Architecture (MVVM)
### 2.1 View (`TransactionsPage.tsx`)
- **Components:** Transaction List/Table, Filters (Date, Category), Add/Edit Modal (`TransactionForm`).
- **Layout:** List view with a header containing actions and filters.
- **Filter context:** A dedicated temporal panel supports Month, Year, and custom Period. Type, search, method, and category controls remain next to the table.
- **Summary order:** Type tabs and the detailed filter panel render above the summary cards. Type tabs affect the list only; summary totals retain both transaction types while respecting detailed filters.
- **Spacing:** The filter-to-summary and summary-to-table gaps both use `--spacing-lg`.
- **Control order:** Type tabs remain at the top; temporal filtering precedes summaries, while search, category, and payment filtering sit next to the table.

### 2.2 ViewModel (`useTransactionsViewModel.ts`)
- **State:** Transactions list, applied filters, modal visibility, currently editing transaction, loading status.
- **Actions:** `addTransaction`, `updateTransaction`, `deleteTransaction`, `applyFilter`.
- **History projection:** Filter persisted transactions directly by their original `date`. Never expand installments for the table or mobile history cards. A credit purchase therefore appears immediately in the period when it was registered and remains one editable record.
- **Period aggregation:** Build a separate internal projection with `expandTransactions` only for the summary cards. Credit expenses use next-month competence even when they have one installment; boleto expenses use current-month competence for their first installment. Search, category, and payment-method filters apply to both projections, while the type tab continues to affect the history list only.
- **Context note:** The period panel explains that rows use the transaction date and totals use installment competence. This is explanatory copy, not a second viewing mode.

### 2.3 Model
- **Entities:** `Transaction` (id, description, amount, type, date, category, paymentMethod).
- **Services:** Firestore CRUD operations on the `transactions` collection.

## 3. i18n
- **Requirements:** Table headers, filter labels, modal titles, and form fields must be translated using `useLocale`.
