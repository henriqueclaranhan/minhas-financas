# Agent Guidelines & Workflow Rules

This document outlines the architecture, UX, and implementation rules for the AI agents working on this project. This ensures a consistent, token-efficient, and highly structured development process.

## 1. Internationalization (i18n)
- **Mandatory Translation:** ALL new implementations, components, forms, pages, and UI elements MUST be translated into the supported languages.
- Never hardcode strings in the UI. Always use the `useLocale()` hook and the translation dictionaries.

## 2. Architecture & Design Pattern (MVVM)
- The project follows the Model-View-ViewModel (MVVM) pattern.
- **View:** React Components (UI only).
- **ViewModel:** Custom hooks (`use<ComponentName>ViewModel.ts`) containing the presentation logic, state management, and interactions.
- **Model:** Firebase/Firestore services and data entities.

## 3. Iteration Rules & Token Efficiency
- Keep contexts lean. Do not output large files unless requested.
- Focus on the specific task. Avoid touching unrelated files or sections.
- When creating specs or documentation, follow the SDD (Software Design Description) guidelines found in `docs/sdd/`.

## 4. Documentation
- All internal documentation and architectural rules must be written in English.
- **Database Schema:** Whenever there is a change to the data models or firestore structure (e.g. adding a new field or collection), you MUST update the `docs/database-schema.md` file to reflect the new structure.

## 5. Business Rules
- **Installments Logic:** 
  - `PaymentMethod.CREDIT`: The first installment of a credit card purchase ALWAYS applies to the **next month** (offset `i`).
  - `PaymentMethod.BOLETO`: The first installment of a parceled Boleto ALWAYS applies to the **current month** (offset `i - 1`).
  - When updating projection logic, finance utilities, or dashboard aggregations, ALWAYS respect these offsets for installments.
