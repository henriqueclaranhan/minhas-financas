# Bugfix: Custom Select Upward Positioning

## Problem

Adding the recurrence interval moves the Planning category field closer to the bottom of the viewport. `CustomSelect` then opens upward by setting a fixed `bottom` position, but the base stylesheet's `top` value remains active. The over-constrained dropdown is rendered outside the usable viewport, preventing category selection.

## Acceptance criteria

- [x] A custom select near the viewport bottom opens upward within the viewport.
- [x] The upward mode explicitly clears the base `top` position.
- [x] The downward mode explicitly clears any `bottom` position.
- [x] Recurring planned expenses can select a category normally.
- [x] The positioning behavior has regression coverage.

