# Codebase Restoration Design

## Approach

The restoration is split into six dependency-ordered changes. Canonical domain values are corrected first. Dead code is then removed before mutation paths and shared UI are refactored, reducing the surface area of later changes. Type/API cleanup follows component extraction. Comment and lint cleanup closes the work.

## Architecture

- `FinanceEnums` remains the source of truth for persisted finance values and gains constants only for repeated application modes.
- `FinanceContext` remains the single mutation boundary used by page ViewModels.
- Shared components live under `src/components/shared`; shared interaction hooks live under `src/hooks`.
- Context providers are separated from consumer hooks when required by Fast Refresh.

## Compatibility

Existing stored legacy values remain readable because model fields that already allow strings are not migrated in this maintenance change. All newly submitted data uses canonical values.

## Verification

Run focused tests for each changed area, followed by the full test suite, TypeScript build, and ESLint where appropriate.
