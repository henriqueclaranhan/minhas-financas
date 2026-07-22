# Recurrence Anchor Requirements

## User stories

- As a user, I want monthly plans created on the 29th, 30th, or 31st to return to their intended day after shorter months.

## Acceptance criteria

- [x] Recurring plans persist their intended day of month as `recurrenceDay` from 1 through 31.
- [x] A month without that day uses its last calendar day without changing the recurrence anchor.
- [x] Later months return to the anchored day when it exists.
- [x] Expansion, Forecast projection, confirmation, and rejection use the same recurrence calculation.
- [x] Existing documents without `recurrenceDay` fall back to the day in `dueDate`.
- [x] Imports accept and validate the optional recurrence anchor.
- [x] Firestore accepts the optional recurrence anchor from 1 through 31 and rejects values outside that range.
