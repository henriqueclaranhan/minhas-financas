# Design: Dashboard Enhancements

## 1. Overview
- **Purpose:** Make the dashboard more interactive (collapsible table) and informative (category pie chart, additional metrics).
- **Route:** `/` (DashboardPage)

## 2. Architecture (MVVM)

### 2.1 View
- **Components:**
  - `DashboardChart`: Update to include a toggle button for the table.
  - `DashboardMetrics`: A new component to hold the new charts.
  - `ExpensesByCategoryChart`: A new pie chart component (using Recharts).
- **Layout:**
  - Inside `DashboardPage`, below `DashboardChart`, we will place a grid layout for the new metrics (e.g., a two-column grid on desktop, single column on mobile).

### 2.2 ViewModel
- **State:**
  - `isTableExpanded`: boolean (read/written to localStorage).
  - `categoryExpenses`: Array of `{ name, value, color }` for the pie chart.
- **Actions:**
  - `toggleTable`: function to toggle and save state.
  - We'll need to fetch transactions and aggregate them by category for the current month in `useDashboardViewModel` or a new hook `useDashboardMetricsViewModel`. Since `useDashboardViewModel` already exists, we can extend it or create a specific hook for the metrics.

### 2.3 Model
- **Services:** We already have transaction fetching. We will need to process the data to aggregate expenses by category.

## 3. i18n
- **Namespace/Keys:**
  - `dashboard.expensesByCategory`
  - `dashboard.noExpenses`
  - `dashboard.toggleTable`

## 4. Data Flow
- `useDashboardViewModel` -> fetches transactions -> groups by category -> passes to `DashboardMetrics` -> renders `ExpensesByCategoryChart`.
