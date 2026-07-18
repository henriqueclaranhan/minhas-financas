# Testing Strategy

This document defines how we test the application to ensure stability while keeping the process lean and fast. We use **Vitest** as our test runner and **React Testing Library (RTL)** for component rendering.

## 1. What We Test

To maximize ROI (Return on Investment) regarding test maintenance, we focus on:

### 1.1 ViewModels (Business & Presentation Logic)
Since we use the MVVM architecture, all state management and business rules live in custom hooks (`use[Name]ViewModel.ts`).
- **Priority: HIGH**
- **How to test:** Use `@testing-library/react`'s `renderHook`.
- **Focus:** State transitions, formatters, sorting/filtering logic, and ensuring loading/error states toggle correctly.

### 1.2 Shared UI Components (Pure Views)
Small, highly reusable UI components (like `CurrencyInput`, `DateInput`, `Modal`).
- **Priority: MEDIUM/HIGH**
- **How to test:** Render the component with RTL and interact with it using `@testing-library/user-event`.
- **Focus:** Rendering correctly with given props, firing appropriate callbacks (e.g., `onChange`, `onSubmit`).

### 1.3 Pages & Integrations
Complex views that tie the ViewModel and external services together.
- **Priority: LOW** (Covered mostly by manual testing or future E2E tests).
- **Why:** Mocking Firebase and all contexts for every page is slow and brittle. Rely on testing the ViewModel in isolation instead.

## 2. Naming & Organization
- Test files must be co-located with the file they are testing or inside the `src/test/` directory mimicking the structure.
- Extension: `*.test.ts` for logic/hooks, `*.test.tsx` for React components.

## 3. Best Practices
1. **Don't test implementation details:** Test the output or the resulting state, not the internal variables of a component.
2. **Mocking:** Only mock what is absolutely necessary (e.g., `firebase/firestore`). Keep mocks simple.
3. **i18n in Tests:** When testing components that use `useLocale`, wrap them in a mock `LocaleProvider` or mock the hook to return the raw keys, avoiding test failures due to translation changes.
