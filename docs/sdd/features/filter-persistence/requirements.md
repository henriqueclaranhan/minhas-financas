# Requirements: Filter Persistence

## Feature Overview
Preserve applied page filters across browser refreshes without persisting uncommitted modal edits.

## Acceptance Criteria
- [x] Applied temporal filters are encoded in each page URL for Transactions, Planning, Invoices, Forecast, and Category Expenses.
- [x] Month, year, and custom-range values are restored after refresh.
- [x] Temporary modal values are persisted only after Apply.
- [x] Invalid or obsolete query values fall back safely to page defaults.
- [x] Expense Breakdown continues using URL parameters as its authoritative filter state.
- [x] Transaction and Planning type/category filters, transaction payment method, and Forecast planned-value toggles persist across refreshes.
- [x] Opening a page from navigation without query parameters uses its defaults instead of filters from a previous visit.
- [x] Browser refresh, history navigation, sharing, and bookmarking preserve applied filters through the URL.
