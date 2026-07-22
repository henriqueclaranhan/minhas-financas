# Design: Expense Categories Analysis

## 1. Overview

- **Purpose:** Expand the Home category summary into a focused spending-analysis screen.
- **Route:** `/categories`
- **Page type:** Secondary destination available from the desktop sidebar and mobile drawer, with Back visible only on mobile.
- **Visual direction:** Reuse the existing financial dashboard language, glass surfaces, category palette, icons, and chart. The distinguishing element is a ranked category breakdown paired with the same visual vocabulary as the Home summary.

## 2. Architecture (MVVM)

### 2.1 View

- **Page:** `CategoryExpensesPage.tsx`
- **Components:**
  - `PageHeader` with translated title and description.
  - A filter panel with Month and Range modes.
  - Month/year controls for Month mode.
  - Start/end date controls for Range mode.
  - A three-card summary matching the Transactions card pattern: total expenses, highest-spending category, and second-highest-spending category.
  - The shared `ExpensesByCategoryChart`.
  - A ranked category breakdown using category icons, translated labels, amounts, and percentages.
  - A translated empty state.
- **Entry point:** Add a translated detail action to `ExpensesByCategoryChart` on Home. The shared chart receives an optional header action so its other usages remain unchanged.
- **Navigation:** Add a translated Categories entry to the secondary navigation group in `Layout`; use `showBackButton={true}` without `forceShowBackButtonOnDesktop`.
- **Responsive layout:** The chart uses the shared expanded variant with reduced lateral padding, a larger donut, and increased legend row spacing; it receives more width than the ranked breakdown on desktop and stacks above it on mobile. Use the canonical `768px` breakpoint and existing design tokens.
- **Vertical rhythm:** The compact unframed period context bar, summary cards, and analysis content use the shared `page-section-stack`, with `--spacing-lg` owned by the page rather than component margins.

### 2.2 ViewModel

- **Hook:** `useCategoryExpensesViewModel.ts`
- **State:**
  - `filterMode: 'month' | 'range'`, defaulting to `month`.
  - Active month/year, defaulting to the current month/year.
  - Active inclusive start/end dates.
  - Temporary filter values while the filter modal is open.
  - `isFilterModalOpen`.
  - Aggregated category data, total, highest-spending category, and second-highest-spending category.
- **Actions:**
  - Open and close filters.
  - Change temporary mode and date values.
  - Apply valid filters.
  - Reset to the current month.
- **Derived values:** Inclusive interval, translated period label, sorted category totals, percentages, and empty-state flag.

### 2.3 Model and utilities

- **Entities:** No schema changes.
- **Utility:** Extract a pure `calculateExpensesByCategory` utility from the current Dashboard ViewModel logic.
- **Inputs:** Transactions, inclusive start date, and inclusive end date.
- **Output:** Sorted category entries containing the raw category key, translation key, amount, color, and percentage.
- **Reuse:** `useDashboardViewModel` calls the same utility with current-month boundaries.
- **Accounting:** The utility preserves the existing Credit and Boleto installment offsets.

## 3. Data Flow

1. `FinanceContext` supplies confirmed transactions.
2. The ViewModel converts the active filter into an inclusive date interval.
3. `calculateExpensesByCategory` expands accounting dates, excludes income, groups expenses, and calculates percentages.
4. The ViewModel exposes presentation-ready category data and total.
5. The View renders the shared chart, ranked breakdown, active period, and empty state.

The active period uses the shared primary period context with a direct Change period action.

## 4. Internationalization

Add Portuguese and English keys under a `categoryExpenses` namespace for:

- Page title and description.
- Month and Range modes.
- Current period label.
- Total expenses.
- Ranked breakdown title.
- Empty state.
- Validation message for an invalid range.
- Home detail action if an existing translated action is not appropriate.

## 5. Accessibility

- Filter mode controls use semantic buttons with visible selected state.
- Date fields keep visible translated labels.
- The category chart is supplemented by the textual ranked breakdown; information is not conveyed by color alone.
- The Back action is available on mobile only; desktop navigation uses the persistent sidebar.
- Focus-visible styles and translated accessible labels remain intact.

## 6. Testing

- Unit-test the aggregation utility, including uncategorized expenses and Credit/Boleto offsets.
- Test ViewModel default state, Month filtering, Range filtering, invalid ranges, Apply, and Reset.
- Test page rendering, empty state, translated category entries, and navigation from Home.
