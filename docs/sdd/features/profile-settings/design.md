# Design: Profile Settings Page

## 1. Overview
- **Purpose:** Allow users to update their personal information (name, email, profile picture) and authentication details (password).
- **Route:** `/settings/profile`

## 2. Architecture (MVVM)
### 2.1 View (`ProfileSettingsPage.tsx`)
- **Components:** Avatar Uploader, Personal Info Form, Password Change Form.
- **Layout:** Vertical stacked forms, with clear separation between profile data and security data. Conditional status feedback and the form use the shared `page-section-stack`; form sections retain the standard `--spacing-xl` gap.

### 2.2 ViewModel (`useProfileSettingsViewModel.ts`)
- **State:** User profile data (name, email), loading/saving status, success/error messages.
- **Actions:** `updateProfile`, `updatePassword`.

### 2.3 Model
- **Entities:** `User`
- **Services:** Firebase Auth (`updateProfile`, `updateEmail`, `updatePassword`).

## 3. i18n
- **Requirements:** Input labels, "Save" buttons, and Firebase error mapping (e.g., "auth/wrong-password") must be translated using `useLocale`.
