# Design: Credit Card Page

## 1. Overview
- **Purpose:** Manage credit cards, view their limits, invoice/bill status, and related transactions.
- **Route:** `/credit-cards`

## 2. Architecture (MVVM)
### 2.1 View (`CreditCardPage.tsx`)
- **Components:** Credit Card List/Grid, Card Details Modal, Add/Edit Card Form.
- **Layout:** Grid of cards or list, showing current bill and available limit.

### 2.2 ViewModel (`useCreditCardViewModel.ts`)
- **State:** List of cards, selected card for details, modal states, loading status.
- **Actions:** `addCard`, `updateCard`, `deleteCard`, `payInvoice`.

### 2.3 Model
- **Entities:** `CreditCard` (id, name, limit, closingDate, dueDate).
- **Services:** Firestore CRUD operations on the `creditCards` collection.

## 3. i18n
- **Requirements:** Card terms ("Limit", "Available", "Invoice", "Due Date"), form fields, and messages must use `useLocale`.
