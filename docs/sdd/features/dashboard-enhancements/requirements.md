# Requirements: Dashboard Enhancements

## Feature Overview
Improve the dashboard by making the balance projection table collapsible (saving state in `localStorage`), and adding new metrics below the main chart. Specifically, a pie chart showing expenses by category, and an income vs expense bar chart or summary. The frontend design should feel premium.

## User Stories
- As a User, I want to collapse the balance projection table so I can see more of the page without scrolling.
- As a User, I want my choice to collapse/expand the table to be remembered across sessions.
- As a User, I want to see my expenses divided by category in a pie chart to understand where my money is going.
- As a User, I want to see a premium, well-designed layout that provides a quick overview of my financial situation.

## Acceptance Criteria
- [ ] The balance table below the line chart in `DashboardChart` has a toggle button (chevron).
- [ ] Toggling the table saves a boolean state in `localStorage`.
- [ ] A new section "Dashboard Metrics" is added below the main chart.
- [ ] The new section contains a Pie Chart for expenses by category.
- [ ] The new section contains another useful metric (e.g., top spending categories or income vs expense).
- [ ] The UI must look premium, utilizing existing design tokens (`var(--clr-primary)`, glass-panels, etc.).
- [ ] Documentation and tests are updated if necessary.

## Edge Cases / Constraints
- What if there are no expenses for the current month? The pie chart should display an empty state beautifully.
- LocalStorage parsing errors should be handled gracefully (defaulting to expanded or collapsed).
