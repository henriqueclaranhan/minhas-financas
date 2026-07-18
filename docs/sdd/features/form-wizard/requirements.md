# Requirements: Form Wizards

## Feature Overview
Convert the `TransactionForm` and `PlannedExpenseForm` into multi-step wizards to improve mobile UX. As these forms gain more fields (like Categories), they become too long to comfortably fit inside a mobile modal without requiring excessive scrolling.

## User Stories
- As a User on a mobile device, I want to input my transaction details in smaller, focused steps so that the form doesn't feel overwhelming.
- As a User, I want to review basic details first and payment/categorization details next.

## Acceptance Criteria
- [x] Both `TransactionForm` and `PlannedExpenseForm` are divided into 2 steps for Mobile.
- [x] Step 1 contains Basic Info: Type, Description, Amount, Date.
- [x] Step 2 contains Advanced Info: Category, Payment Method, Installments, Recurrence (for planning).
- [x] The forms must have 'Next', 'Back', and 'Submit' buttons on Mobile.
- [x] Basic validation must occur before allowing the user to move to Step 2.
- [x] The UI should show an indicator of the current step (e.g., "Passo 1 de 2").
- [x] **Desktop View**: On larger screens (>=768px), forms should display both steps simultaneously in a 2-column grid layout, bypassing the wizard navigation steps to provide a single-page filling experience. The right column (Step 2 inputs) should have a slightly darker background and border-radius.

## Edge Cases / Constraints
- The wizard state should reset when the form is submitted or closed.
- Keyboard focus and accessibility should be maintained between steps.
