# Recurrence Anchor Design

## Model

`PlannedExpense.recurrenceDay?: number` stores the intended calendar day. It is optional for backward compatibility. New recurring forms derive it from the selected due date. Existing records derive it at runtime from `dueDate` and persist it when the next occurrence is generated.

Firestore security rules include the optional field in the planned-expense allowlist and validate it as an integer from 1 through 31. This keeps direct writes aligned with the model and import validation while preserving documents created before the field existed.

## Shared recurrence rule

`recurrenceUtils` owns month advancement. It moves to the target month and chooses `min(recurrenceDay, daysInTargetMonth)`. Calculation consumers call this utility instead of chaining raw `addMonths`, preventing `31 Jan -> 28 Feb -> 28 Mar` drift. The result becomes `31 Jan -> 28 Feb -> 31 Mar -> 30 Apr`.

## Transactions and projections

Planning expansion and Forecast projection advance virtual occurrences with the shared utility. Firestore confirmation and rejection transactions use the same utility and copy `recurrenceDay` into the deterministic next pending document.
