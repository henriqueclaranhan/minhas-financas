# Design: Transaction Categorization

## 1. Overview
- **Purpose:** Allow users to categorize transactions to better understand their finances.
- **Route:** All routes containing transaction lists or forms.

## 2. Architecture (MVVM)

### 2.1 View
- **Components:** 
  - `TransactionForm`: Add a select input for `category`.
  - `TransactionTable`: Add a column for `category`.
  - `PlannedExpenseForm` (if applicable): Add category select.
  - `ExpensesByCategoryChart`: Reuse `getCategoryIcon` in the legend and tooltip.
- **Layout:** Integrate smoothly into existing form rows and table headers.

### 2.2 ViewModel
- **State:** `category` in `TransactionForm`.
- **Actions:** Update `category` state on selection change.

### 2.3 Model
- **Entities:** 
  - Update `Transaction` and `PlannedExpense` interfaces in `src/types/index.ts` to include `category?: TransactionCategory`.
  - Add `TransactionCategory` enum in `src/enums/FinanceEnums.ts`.
- **Services:** Firestore services will naturally save the new optional field.

## 3. i18n
- **Namespace/Keys:** 
  - `categories.food`, `categories.transport`, `categories.housing`, etc.
  - `categories.salary`, `categories.investment`, etc.
  - `form.category`

## 4. Data Flow
- `TransactionForm` sets the `category` string.
- The `category` string is passed to `onSubmit`.
- Passed to Firestore.
- Fetched and displayed in `TransactionTable` translated via `i18n`.
- Category chart entries derive their icon from the stored category key and their label from `i18n`.
