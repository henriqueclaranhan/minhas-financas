# PWA Shortcuts Design

## Manifest

Add four `shortcuts` entries to the Vite PWA manifest, matching the primary destinations defined by `Layout`:

- `/`
- `/transactions`
- `/planned`
- `/credit`

Each shortcut references a dedicated 192 px PNG generated from the same Lucide glyph used by `Layout`:

- Home: `LayoutDashboard`
- Transactions: `Wallet`
- Planning: `CalendarClock`
- Invoices: `CreditCard`

The shortcut assets use transparent backgrounds so the operating system can place them in its native context-menu presentation. Operating systems and browsers decide whether and how many shortcuts are displayed.
