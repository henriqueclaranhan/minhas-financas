# Design: Internationalization (i18n)

## 1. Overview
- **Purpose:** Provide a centralized mechanism for language translation across all pages and components.
- **Route:** Global (affecting all routes).

## 2. Architecture (MVVM)

### 2.1 View
- **Components:** `LocaleProvider` wrapping the application root. Language Selector in `SettingsPage`.
- **Layout:** Transparent to layout, but provides the `t` function to all components.
- **Chart formatting:** Currency values use `formatCurrency`; other numeric labels use `Intl.NumberFormat` with the active locale from `useLocale()`.

### 2.2 ViewModel
- **State:** Current `locale` (e.g., 'pt', 'en').
- **Actions:** `setLocale(lang)` exposed via a custom hook `useLocale()`.

### 2.3 Model
- **Entities:** Translation dictionaries (JSON or TS objects) for each supported language.
- **Services:** LocalStorage API to persist the user's language choice.

## 3. i18n
- **Namespace/Keys:** Contains keys for every component (e.g., `auth.login`, `dashboard.totalBalance`).

## 4. Data Flow
`LocaleProvider` initializes from LocalStorage -> Child components call `useLocale().t('key')` -> When `setLocale` is called, React Context triggers a re-render updating all strings.
