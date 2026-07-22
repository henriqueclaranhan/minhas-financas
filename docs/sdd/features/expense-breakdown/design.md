# Design: Expense Breakdown

## 1. Overview

- **Purpose:** Reconcile the expense summary by showing the competence entries that compose it.
- **Route:** `/expenses/breakdown`
- **Page type:** Nested page opened from dashboard and transaction summary cards.

## 2. Product Design

- The page is an explanatory ledger, not another transaction history.
- Its signature element is a reconciliation panel where the total is visibly expressed as payments plus credit-card installments, with a proportional composition rail.
- Existing typography, semantic colors, glass surfaces, and design tokens remain authoritative. Danger identifies the total expense, while primary and warning distinguish the two composition groups.
- Desktop uses two adjacent, always-open ledger sections. Mobile keeps both sections in one continuous vertical reading order without tabs; each section can be collapsed independently and starts open. The content animates with a brief height-and-opacity transition synchronized with the disclosure chevron, with motion disabled by the user's reduced-motion preference.

## 3. Architecture (MVVM)

### 3.1 View (`ExpenseBreakdownPage.tsx`)

- Uses `PageHeader` with back navigation on desktop and mobile.
- Relies on the shared safe-back behavior: traverse a prior React Router entry when available, otherwise replace the current route with Home.
- Uses the compact unframed `PeriodContext` bar and `TemporalFilterModal` for Month, Year, and custom Period selection, without a panel surface or wrapper.
- Renders a reconciliation hero followed by payment and credit-installment ledgers.
- Uses one responsive DOM representation so hidden duplicate lists do not add interaction work.

### 3.2 ViewModel (`useExpenseBreakdownViewModel.ts`)

- Reads persisted transactions from `FinanceContext`.
- Initializes its temporal filter from URL search parameters when provided.
- Calls `expandTransactions` with the active ISO period, then retains expense entries only.
- Groups credit entries separately from all other payment methods and calculates both subtotals from the same projected entries used by the UI.
- Exposes the active period as URL parameters so entry points and period changes remain shareable and reload-safe.

### 3.3 Shared Entry Points

- `PeriodSummaryCards` accepts an optional expense destination. When supplied, only the expense card becomes a semantic link.
- Navigable expense cards retain the shared top-right chevron affordance on desktop and mobile without supplementary “View breakdown” copy.
- Dashboard monthly expenses link to the default current-month breakdown.
- Transactions build a destination from their active temporal filter.

## 4. Data Model

- No Firestore schema changes are required.
- `ExpandedTransaction` supplies competence date, installment position, original amount, and original transaction identifier.

## 5. Accessibility and i18n

- The reconciliation uses text and values in addition to color.
- Links retain visible keyboard focus through global styles.
- All headings, explanations, labels, and empty states use translation keys.
