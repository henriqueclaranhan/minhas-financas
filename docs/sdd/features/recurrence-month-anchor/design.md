# Recurrence Anchor Design

## Model

`PlannedExpense.recurrenceDay?: number` stores the intended calendar day. It is optional for backward compatibility. New recurring forms derive it from the selected due date. Existing records derive it at runtime from `dueDate` and persist it when the next occurrence is generated.

## Shared recurrence rule

`recurrenceUtils` owns month advancement. It moves to the target month and chooses `min(recurrenceDay, daysInTargetMonth)`. Calculation consumers call this utility instead of chaining raw `addMonths`, preventing `31 Jan -> 28 Feb -> 28 Mar` drift. The result becomes `31 Jan -> 28 Feb -> 31 Mar -> 30 Apr`.

## Transactions and projections

Planning expansion and Forecast projection advance virtual occurrences with the shared utility. Firestore confirmation and rejection transactions use the same utility and copy `recurrenceDay` into the deterministic next pending document.
