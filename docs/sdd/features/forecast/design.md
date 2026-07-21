# Design: Forecast Page

## 1. Overview
- **Purpose:** Provide a projection of future financial balances based on planned expenses, recurring transactions, and expected income.
- **Route:** `/forecast`

## 2. Architecture (MVVM)
### 2.1 View (`ForecastPage.tsx`)
- **Components:** Forecast Line Chart, Future Balance Table, Parameters Form (e.g., months ahead).
- **Layout:** Chart-dominant layout with a data table below.
- **Spacing:** The content wrapper does not add a flex gap; each panel uses the same component margins applied on other pages.
- **Projection toggles:** Planned income and expense controls live in a dedicated panel immediately before the projection chart.
- **Filter context:** The shared temporal panel supports Month, Year, and custom Period independently from projection characteristics.
- **Summary order:** The forecast filter panel renders before the period summary cards and projection chart.
- **Summary spacing:** The filter-to-summary and summary-to-chart gaps both use `--spacing-lg`.
- **Vertical axis:** Uses locale-aware compact currency notation and derives a bounded width from the longest candidate label. Exact currency formatting remains in tooltips and the supporting table.

### 2.2 ViewModel (`useForecastViewModel.ts`)
- **State:** Forecast data points, projection parameters (months), loading status.
- **Actions:** `calculateForecast`, `updateParameters`.

### 2.3 Model
- **Entities:** `ForecastDataPoint`
- **Services:** Heavy computation logic aggregating `PlannedExpenses` and recurring `Transactions` from Firestore to generate a timeline.

## 3. i18n
- **Requirements:** Chart labels, axes, table headers, and parameter inputs must be translated via `useLocale`.
