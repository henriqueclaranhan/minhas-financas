# Database Schema and Data Models

This document describes the entities currently used by the application and distinguishes persisted Firestore documents from Firebase Authentication records, browser-local preferences, backup payloads, and runtime-only projections.

## Storage Overview

```text
Firebase Authentication
└── User (managed by Firebase Auth)

Cloud Firestore
└── users/{uid}
    ├── initialBalance
    ├── transactions/{transactionId}
    ├── plannedExpenses/{plannedExpenseId}
    ├── competenceEntries/{transactionId--position}
    └── importJobs/{fingerprint}

Browser localStorage
├── @financas:theme
└── @financas:locale:{uid}
```

There are no global finance collections and no persisted `creditCards` collection. Credit-card bills, dashboard projections, category totals, and expanded installments are calculated from transactions and planned expenses at runtime.

## Common Domain Values

### Transaction type

```typescript
type TransactionType = 'income' | 'expense';
```

### Payment method

```typescript
type PaymentMethod =
  | 'credit'
  | 'debit'
  | 'pix'
  | 'cash'
  | 'transfer'
  | 'boleto';
```

### Planned-expense status

```typescript
type ExpenseStatus = 'pending' | 'confirmed' | 'cancelled';
```

### Categories

Expense categories:

```text
food, transport, housing, health, education, entertainment,
shopping, pets, clothing, investment, others
```

Income categories:

```text
salary, investment, gift, others
```

Categories are currently stored as strings. The client uses the values above, while Firestore rules enforce only that the value is a non-empty string of at most 100 characters.

## Firebase Authentication Entity

Firebase Authentication owns identity and credentials. The application directly uses these fields from Firebase's `User` object:

```typescript
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}
```

Passwords and authentication tokens are managed by Firebase Authentication and are never stored in Firestore documents or application backups.

## Firestore Entities

### User finance document

Path: `users/{uid}`

```typescript
interface UserFinanceDocument {
  initialBalance?: number | null;
  financeSchemaVersion?: number;
  financeMigrationCursor?: string | null;
}
```

| Field | Required | Constraints | Notes |
|---|---:|---|---|
| `initialBalance` | No | Firestore number or `null` | Starting balance used by dashboard and forecast calculations. Clearing finance data sets it to `0`. |
| `financeSchemaVersion` | No | Integer from 1 to 2 | Version 2 indicates that transaction competence entries are fully materialized. |
| `financeMigrationCursor` | No | Document ID or `null` | Resumable cursor used while backfilling legacy transactions. Cleared after migration. |

The document ID is the authenticated Firebase UID. Security rules allow only the matching user to read or update it, reject unknown fields, and do not allow client deletion of the root user document.

### Transaction

Path: `users/{uid}/transactions/{transactionId}`

```typescript
interface TransactionDocument {
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  installments: number;
  date: string;
  type?: TransactionType;
  plannedExpenseId?: string;
  sourceKey?: string;
  category?: string;
}
```

| Field | Required | Constraints | Notes |
|---|---:|---|---|
| `description` | Yes | Non-empty string, maximum 200 characters | User-facing description. |
| `amount` | Yes | Positive Firestore number | Decimal monetary value in the selected display currency. Integer-cent storage is not implemented. |
| `paymentMethod` | Yes | One of `PaymentMethod` | Determines installment competence rules. |
| `installments` | Yes | Integer from 1 to 360 | `1` represents a single payment. |
| `date` | Yes | String shaped as `YYYY-MM-DD` | Purchase or transaction date. Import validation additionally verifies the calendar date. |
| `type` | No | `income` or `expense` | Missing values are treated as expenses by legacy-compatible calculations. |
| `plannedExpenseId` | No | Non-empty string, maximum 128 characters | Links a confirmed planned expense to its generated transaction. |
| `sourceKey` | No | Non-empty string, maximum 300 characters | Idempotency key for generated transactions, currently `plannedExpense:{id}:confirmation`. |
| `category` | No | Non-empty string, maximum 100 characters | Domain category key. Missing expense categories fall back to `others` in category reports. |

The TypeScript `id` property is a client-side projection of `{transactionId}` and is not stored inside the document.

#### Materialized installment competence

- Credit expenses apply their first installment to the month after `date`.
- Boleto expenses apply their first installment to the same month as `date`.
- Other payment methods are not expanded into monthly installments by current reporting utilities.
- Every transaction write atomically creates deterministic documents in `competenceEntries`. Existing transactions are backfilled before temporal queries become authoritative.

### Competence entry

Path: `users/{uid}/competenceEntries/{transactionId}--{position}`

```typescript
interface CompetenceEntryDocument {
  transactionId: string;
  description: string;
  amount: number;
  competenceDate: string;
  originalDate: string;
  paymentMethod: PaymentMethod;
  type: TransactionType;
  category?: string;
  installmentNumber: number;
  totalInstallments: number;
}
```

Entries are derived, owner-only documents used by interval queries and shared aggregates. Their IDs and positions are deterministic. Transaction update and deletion modify the source and all affected entries in a Firestore transaction. Derived entries are not exported because they can be rebuilt from source transactions.

### Import job

Path: `users/{uid}/importJobs/import-{fingerprint}`

```typescript
interface ImportJobDocument {
  fingerprint: string;
  status: 'validated' | 'writing' | 'completed' | 'failed';
  processed: number;
  total: number;
  updatedAt: string;
  error?: string;
}
```

The job records the last committed source-item checkpoint. Re-selecting the same backup resumes a failed import from that checkpoint. Each transaction import unit includes its competence entries in the same bounded batch.

### Planned expense

Path: `users/{uid}/plannedExpenses/{plannedExpenseId}`

```typescript
interface PlannedExpenseDocument {
  description: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  recurrenceInterval: number;
  recurrenceDay?: number;
  status: ExpenseStatus;
  userId?: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  installments?: number;
  category?: string;
  sourcePlannedExpenseId?: string;
}
```

| Field | Required | Constraints | Notes |
|---|---:|---|---|
| `description` | Yes | Non-empty string, maximum 200 characters | User-facing description. |
| `amount` | Yes | Positive Firestore number | Decimal planned amount. |
| `dueDate` | Yes | String shaped as `YYYY-MM-DD` | Base due date; imports also validate the calendar date. |
| `isRecurring` | Yes | Boolean | Enables generation of the next occurrence after processing. |
| `recurrenceInterval` | Yes | Integer from 1 to 120 | Interval between recurring occurrences, in months. |
| `recurrenceDay` | No | Integer from 1 to 31 | Intended calendar day for recurrence. Shorter months use their final day; legacy documents fall back to the day in `dueDate`. |
| `status` | Yes | `pending`, `confirmed`, or `cancelled` | Only pending entries may transition to another status. Processed entries cannot transition again. |
| `userId` | No | Non-empty string, maximum 128 characters | Legacy-compatible field. Ownership is determined by the `users/{uid}` path, not this value. |
| `type` | No | `income` or `expense` | Missing values are treated as expenses by current views. |
| `paymentMethod` | No | One of `PaymentMethod` | Used for installment projection when provided. |
| `installments` | No | Integer from 1 to 360 | Defaults to one in calculation utilities when absent. |
| `category` | No | Non-empty string, maximum 100 characters | Domain category key. |
| `sourcePlannedExpenseId` | No | Non-empty string, maximum 128 characters | Links a generated recurring occurrence to its preceding planned expense. |

The TypeScript `id` property is populated from `{plannedExpenseId}` when documents are read and is not persisted as a field.

Planning screens query active documents with `status == pending` and order them by `dueDate` plus document ID for cursor pagination. Composite indexes for the ascending paginated query and descending active listener are declared in `firestore.indexes.json`.

## Relationships and Lifecycle

```text
PlannedExpense (pending)
├── confirm ──> PlannedExpense (confirmed)
│               └── creates Transaction
└── cancel ───> PlannedExpense (cancelled)

Recurring PlannedExpense
└── confirm or cancel ──> creates next PlannedExpense (pending)
```

Confirmation and cancellation run inside Firestore transactions. The generated IDs are deterministic:

```text
transaction:     planned-expense-{plannedExpenseId}-confirmation
next recurrence: planned-expense-{plannedExpenseId}-next
```

The deterministic IDs and the status check inside the Firestore transaction make retries converge on the same documents instead of creating duplicates.

## Backup Entity

Exports produce a JSON envelope rather than a Firestore collection:

```typescript
interface FinanceBackup {
  initialBalance: number | null;
  transactions: Array<TransactionDocument & { id?: string }>;
  plannedExpenses: Array<PlannedExpenseDocument & { id?: string }>;
}
```

Import constraints:

- maximum JSON size: 5 MiB;
- maximum combined items: 50,000;
- document IDs, when supplied, must match `[A-Za-z0-9_-]{1,128}`;
- duplicate IDs inside the same collection are rejected;
- supplied IDs that already exist are rejected instead of overwritten;
- unsupported fields, invalid dates, invalid enums, non-positive amounts, and out-of-range installments are rejected;
- writes are committed in batches of at most 400 operations.

## Browser-Local Preference Entities

These values are not synchronized to Firestore and are not included in finance backups.

### Theme preference

Key: `@financas:theme`

```typescript
type ThemePreference = 'light' | 'dark' | 'system';
```

### Locale and currency preference

Key: `@financas:locale:{uid}`

```typescript
interface LocalePreference {
  locale: 'pt-BR' | 'en-US';
  currency: 'BRL' | 'USD';
}
```

The locale and currency default from the browser language when the user has no saved preference.

## Runtime-Only Derived Models

The following entities are calculated in memory and must not be treated as Firestore collections:

- `ExpandedTransaction`: a compatibility projection used before or outside authenticated materialized queries;
- `ExpandedPlannedExpense`: a planned-expense installment intersecting the selected period;
- credit-card monthly bill and bill items;
- dashboard and forecast monthly projection points;
- category expense totals and percentages;
- finance loading and error state exposed by `FinanceContext`.

## Read and Write Behavior

- The shared transaction listener is limited to the 50 most recent source documents for recent activity and mutation refreshes.
- Transaction history uses cursor-based lazy loading ordered by date and document ID.
- Period totals, breakdowns, invoices, categories, dashboard values, and forecasts query `competenceEntries` by `competenceDate` and reuse the shared one-pass aggregate.
- Planned-expense listeners order documents by `dueDate` descending and currently remain complete for the same aggregate-correctness reason.
- Schema version 2 backfill is resumable and completes before competence queries run.
- Exports read both subcollections directly in deterministic pages of 400 documents and never depend on the currently rendered view.
- Clearing data reads and deletes each finance subcollection in pages of 400 documents, then resets `initialBalance` to zero.
- All Firestore reads and writes require an authenticated user whose UID matches the `users/{uid}` path.
