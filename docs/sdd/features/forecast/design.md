# Design: Forecast Page

## 1. Overview
- **Purpose:** Provide a projection of future financial balances based on planned expenses, recurring transactions, and expected income.
- **Route:** `/forecast`

## 2. Architecture (MVVM)
### 2.1 View (`ForecastPage.tsx`)
- **Components:** Forecast Line Chart, Future Balance Table, Parameters Form (e.g., months ahead).
- **Layout:** Chart-dominant layout with a data table below.

### 2.2 ViewModel (`useForecastViewModel.ts`)
- **State:** Forecast data points, projection parameters (months), loading status.
- **Actions:** `calculateForecast`, `updateParameters`.

### 2.3 Model
- **Entities:** `ForecastDataPoint`
- **Services:** Heavy computation logic aggregating `PlannedExpenses` and recurring `Transactions` from Firestore to generate a timeline.

## 3. i18n
- **Requirements:** Chart labels, axes, table headers, and parameter inputs must be translated via `useLocale`.
