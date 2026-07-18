# Design: Auth Page

## 1. Overview
- **Purpose:** Handle user authentication (login and registration).
- **Route:** `/login` / `/register` (or root when unauthenticated)

## 2. Architecture (MVVM)
### 2.1 View (`AuthPage.tsx`)
- **Components:** Login Form, Registration Form, Social Login Buttons.
- **Layout:** Centered authentication card with toggles between login and sign up.

### 2.2 ViewModel (`useAuthViewModel.ts`)
- **State:** Email, password, loading status, error messages, current mode (login vs register).
- **Actions:** `handleLogin`, `handleRegister`, `handleGoogleSignIn`, `toggleMode`.

### 2.3 Model
- **Services:** Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithPopup`).

## 3. i18n
- **Requirements:** All form labels, placeholders, error messages, and buttons must be translated using `useLocale`.
