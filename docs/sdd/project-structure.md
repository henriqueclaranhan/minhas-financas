# Project Structure

This document outlines the directory structure of the `web-app` focusing on the `src/` directory. We follow a feature-centric modular approach combined with global shared directories.

## `src/` Directory Tree

```text
src/
├── assets/          # Static files, images, icons not handled by React components
├── components/      # Shared/Global UI components (Forms, Inputs, Modals, Layout)
│   ├── CurrencyInput/
│   ├── DateInput/
│   ├── Layout/      # Main application layout (Sidebar, Header, etc.)
│   ├── Modal/       # Reusable modal wrapper
│   ├── OnboardingWizard/
│   ├── PlannedExpenseForm/
│   ├── TransactionForm/
│   └── shared/      # Small generic UI pieces (e.g., FilterTabs)
├── config/          # Environment configuration, constants, Firebase init
├── enums/           # TypeScript enums and string constants
├── i18n/            # Translation dictionaries (pt.ts, en.ts) and LocaleContext
├── pages/           # Application routes/screens
│   ├── AuthPage/             # ├── components/ (Page-specific UI)
│   ├── CreditCardPage/       # └── hooks/      (ViewModels: useAuthViewModel)
│   ├── DashboardPage/
│   ├── ForecastPage/
│   ├── PlannedExpensesPage/
│   ├── ProfileSettingsPage/
│   ├── SettingsPage/
│   └── TransactionsPage/
├── services/        # External API calls, Firebase interactions, business logic
├── store/           # Global State Contexts (e.g., AuthContext)
├── styles/          # Global CSS files (index.css)
├── test/            # Vitest and React Testing Library tests
│   ├── components/  # Tests for shared components
│   ├── pages/       # Tests for page logic and ViewModels
│   ├── services/    # Tests for backend integration logic
│   └── utils/       # Tests for helper functions
└── types/           # Global TypeScript interfaces and type definitions
```

## Folder Structure Rules

1. **Pages as Modules:** Each page inside `src/pages/` must be self-contained. It should have its own `hooks/` directory for its ViewModel (`use[PageName]ViewModel.ts`), and a `components/` directory for UI pieces used *only* on that page.
2. **Shared Components:** If a UI component is used by more than one page (e.g., `TransactionForm`), it must be placed in `src/components/`.
3. **Services:** Any interaction with Firebase, external APIs, or complex data transformations must be extracted into `src/services/` to keep ViewModels clean.
4. **Types:** Centralize shared entity types (like `Transaction`, `User`) in `src/types/` so they can be easily imported by both Models and ViewModels.
