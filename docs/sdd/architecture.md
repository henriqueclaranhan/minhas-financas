# SDD: Architecture Overview

## 1. Introduction
This document provides a comprehensive architectural overview of the "Minhas Finanças" web application. Its purpose is to ensure all future implementations align with our established patterns, maintaining a lean, predictable, and token-efficient codebase. We embrace a Software Design Description (SDD) methodology to document decisions before execution.

## 2. System Architecture
The system adopts a client-side rendered (CSR) Single Page Application (SPA) architecture, built with React and Vite.

### 2.1 MVVM Pattern
We enforce a strict Model-View-ViewModel (MVVM) pattern to achieve high modularity and testability:
- **Model:** Represents the data structures and business logic (e.g., Firebase services, entity types, pure data transformations).
- **ViewModel:** Encapsulates presentation logic. Implemented as custom React hooks (e.g., `useDashboardViewModel`). It abstracts state, side effects, and async operations away from the UI.
- **View:** Pure, stateless (or minimally stateful) React components responsible *only* for rendering UI based on the ViewModel's state and delegating user events back to the ViewModel.

### 2.2 Internationalization (i18n)
The application relies heavily on dynamic localization.
- **Rule:** Direct hardcoding of strings in the UI is strictly prohibited.
- **Implementation:** All text is managed via a custom context (`LocaleContext` / `useLocale`). Future specs and implementations must account for translation keys in all supported languages.

## 3. Technology Stack
- **Core Framework:** React 19, TypeScript, Vite.
- **Routing:** React Router v7 (`react-router-dom`).
- **Styling & UI:** Vanilla CSS + Lucide React.
- **Data Visualization:** Recharts.
- **Date Manipulation:** date-fns.
- **Backend / Database / Auth:** Firebase.
- **Testing:** Vitest & React Testing Library.
- **Linting:** Oxlint.

## 4. Development & Iteration Workflow
1. **Spec First:** Before coding, create or update a retroactive SDD spec in `docs/sdd/`.
2. **Lean Context:** Keep modifications focused on exactly what is described in the spec.
3. **Review & Translate:** Ensure the view model handles the logic and the view incorporates the `useLocale` hook correctly.
