# Design: Settings Page

## 1. Overview
- **Purpose:** Serve as the main hub for application settings (e.g., appearance, language, categories).
- **Route:** `/settings`

## 2. Architecture (MVVM)
### 2.1 View (`SettingsPage.tsx`)
- **Components:** Settings Menu/Grid, Theme Toggle, Language Selector.
- **Layout:** Grouped lists of settings options.

### 2.2 ViewModel (`useSettingsViewModel.ts` / Global Context)
- **State:** Current theme, current language.
- **Actions:** `toggleTheme`, `changeLanguage`.

### 2.3 Model
- **Services:** LocalStorage or remote user preferences to persist settings.

## 3. i18n
- **Requirements:** Section titles ("Appearance", "Language") and option names must be translated using `useLocale`.
