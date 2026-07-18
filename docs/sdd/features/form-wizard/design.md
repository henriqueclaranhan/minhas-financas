# Design: Form Wizards

## 1. Overview
- **Purpose:** Break down `TransactionForm` and `PlannedExpenseForm` into a 2-step wizard.

## 2. Architecture (MVVM)

### 2.1 View
- **Components:** 
  - `TransactionForm` and `PlannedExpenseForm`.
  - Add state `currentStep` (number, default 1).
- **Layout:**
  - **Mobile:**
    - Header: Indicator (e.g., "Passo 1 de 2").
    - Body: Conditional rendering of fields based on `currentStep`.
    - Footer: 'Next' button if step 1. 'Back' and 'Submit' buttons if step 2.
  - **Desktop (min-width: 768px):**
    - Both columns are shown side-by-side using CSS Grid (`desktop-wizard-layout`).
    - The wizard behavior (`currentStep`) is effectively bypassed.
    - Right column has a distinct `step2-column` styling (translucent background, borders) to group advanced fields.

### 2.2 ViewModel / State
- **State:** `step` = 1 | 2.
- **Actions:** 
  - `nextStep()`: validates step 1 fields, increments `step`.
  - `prevStep()`: decrements `step`.

### 2.3 Model
- No changes to data models.

## 3. i18n
- **Namespace/Keys:** 
  - `form.next`: "Próximo"
  - `form.back`: "Voltar"
  - `form.step`: "Passo {{current}} de {{total}}"

## 4. Data Flow
- User fills Step 1 -> clicks Next -> User fills Step 2 -> clicks Submit -> `onSubmit` is called with the full state.
