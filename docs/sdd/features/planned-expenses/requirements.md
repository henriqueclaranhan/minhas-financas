# Requirements: Planned Expenses

## Feature Overview
Manage future and recurring financial commitments.

## User Stories
- As a User, I want to register a recurring bill (e.g., Netflix) so it's accounted for in my forecast.
- As a User, I want to mark a planned expense as paid to turn it into a real transaction.

## Acceptance Criteria
- [x] Form to create planned expenses with frequency.
- [x] List view of upcoming expenses.
- [x] Action button to convert planned expense to a transaction ("Mark as Paid").\n
- [x] Income and expense summary cards show both totals for the active detailed filters regardless of the selected type tab.
- [x] Date filtering supports Month, Year, and custom Period independently from search and category filters.
- [x] The planning list loads pending source documents in cursor-based pages as the user scrolls.
- [x] Processed plans do not remain in the global realtime working set.
- [x] Period totals remain exact and independent from the pages currently rendered.
- [x] Planning can be filtered by payment method, with all methods selected by default.
- [x] Payment method combines with period, type, search, and category filters; Apply and Reset control the active URL-persisted selection.
- [x] A pending recurring plan contributes every occurrence that falls within the selected period, according to its recurrence interval.
