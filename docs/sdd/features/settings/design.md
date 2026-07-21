# Design: Settings Page

## 1. Overview
- **Purpose:** Serve as the main hub for application settings (e.g., appearance, language, categories).
- **Routes:** `/settings` and nested `/settings/data`

## 2. Architecture (MVVM)
### 2.1 View (`SettingsPage.tsx`)
- **Components:** Settings Menu/Grid, Theme Toggle, Language Selector, Data destination, and `DataSettingsPage`.
- **Layout:** The settings hub presents Data as a navigable row consistent with Profile and Privacy Policy. The nested Data screen owns export, import, import progress, and clear-data actions in one panel.

### 2.2 ViewModel (`useSettingsViewModel.ts` / Global Context)
- **State:** Current theme, current language.
- **Actions:** `toggleTheme`, `changeLanguage`.

### 2.3 Model
- **Services:** LocalStorage or remote user preferences to persist settings.

## 3. i18n
- **Requirements:** Page titles (including "Data"), preference labels, descriptions, and action names must be translated using `useLocale`.
