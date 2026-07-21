# Design: Not Found Page

## 1. Overview
- **Purpose:** Explain an unmatched URL and provide a single recovery path.
- **Route:** Any unmatched route (`*`).

## 2. Architecture (MVVM)

### 2.1 View
- **Component:** `NotFoundPage`.
- **Layout:** Centered glass panel with a ledger-inspired 404 marker, concise copy, and one primary link to `/`.
- **UI pattern exception:** The page does not use `PageHeader` because it is an exceptional routing state rather than a navigable application destination.

### 2.2 ViewModel
- No dedicated ViewModel is required because the page has no mutable state or presentation logic.

### 2.3 Model
- No entities, services, or persistence changes.

## 3. i18n
- **Namespace:** `notFound.*` for the eyebrow, title, description, and recovery action.

## 4. Data Flow
React Router matches `*` -> `NotFoundPage` reads translated copy from `useLocale()` -> the recovery link replaces the invalid history entry with `/`.

