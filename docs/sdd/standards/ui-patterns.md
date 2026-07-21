# UI Patterns

## 1. Purpose and authority

This document is the source of truth for cross-cutting UI conventions in Minhas Finanças. Feature specifications may add requirements, but they must not silently contradict these patterns. If a feature needs an exception, document the reason in its `design.md` and update this file when the exception establishes a reusable convention.

These rules apply to new UI and to existing UI touched by an iteration. They do not require unrelated screens to be refactored as part of a narrowly scoped change.

Normative terms such as **MUST**, **SHOULD**, and **MAY** indicate requirement strength.

## 2. Product design direction

- The interface follows a restrained, platform-aware financial dashboard aesthetic: clear hierarchy, compact data presentation, semantic colors, and translucent surfaces used consistently.
- UI decisions MUST use the tokens in `src/styles/index.css`. Do not introduce literal colors, spacing, radii, typography, or transition values when an appropriate token exists.
- `Inter` is the body and data typeface. `Outfit` is the display and heading typeface.
- Primary, success, warning, and danger colors MUST retain their semantic meaning. Do not use semantic colors as arbitrary decoration.
- Light and dark themes MUST be considered together. New surfaces and text MUST use theme tokens rather than theme-specific hardcoded values.

## 3. Page types and navigation

Classify a page before implementing its header or navigation.

### 3.1 Primary destination

A primary destination is directly available from the application's main navigation, such as Home, Transactions, Planning, and Invoices.

- It MUST use `PageHeader`.
- It MUST NOT show a back button on desktop or mobile because the main navigation establishes its location.

### 3.2 Secondary destination

A secondary destination is available from the sidebar or mobile drawer but is not a primary tab, such as Forecast and the Settings hub.

- It MUST use `PageHeader`.
- It SHOULD show a back button on mobile, where persistent navigation is unavailable.
- It SHOULD NOT show a back button on desktop while the sidebar remains visible.
- With the current `PageHeader` API, use `showBackButton={true}` without `forceShowBackButtonOnDesktop`.

### 3.3 Nested page or subsection

A nested page is opened from another page and is not directly represented in the main navigation, such as Profile Settings or a legal/detail page.

- It MUST use `PageHeader`.
- It MUST show a back button on both mobile and desktop.
- With the current `PageHeader` API, use both `showBackButton={true}` and `forceShowBackButtonOnDesktop={true}`.
- Back navigation MUST return to the logical parent or previous location. If browser history is not reliable for a flow, navigate explicitly to the parent route.
- Shared back navigation MUST only traverse browser history when React Router identifies a prior in-app entry. Otherwise, it MUST replace the current entry with the configured logical fallback, defaulting to Home (`/`), so direct or externally referred visits do not leave the application.

## 4. Standard page anatomy

Pages SHOULD follow this order when the corresponding elements exist:

1. Page wrapper and entry animation.
2. `PageHeader` with title, optional description, and optional primary action.
3. Page-level feedback, warning, or status.
4. Summary or key metrics.
5. Filters, search, and contextual controls.
6. Primary content.
7. Secondary content.
8. Mobile floating action button when the desktop primary action is hidden.
9. Modals rendered outside the content flow.

Use existing shared components before creating page-local equivalents. Presentation logic, filtering, async actions, and UI state belong in the page ViewModel according to the repository MVVM rules.

## 5. Headers and text hierarchy

- Every full page MUST have exactly one visible `h1`, supplied through `PageHeader`.
- Page titles MUST be short nouns or noun phrases and use sentence case.
- Page descriptions SHOULD explain the page's job in one concise sentence. They must not repeat the title.
- Major sections inside a page use `h2`. Card and panel titles use `h3`. Heading levels MUST not be chosen for visual size alone.
- A page-level primary action belongs in `PageHeader.primaryButton`. Do not create a second competing primary action beside the header.
- On mobile, when the header action is hidden, the equivalent frequent creation action SHOULD be exposed through the shared FAB pattern.
- All user-facing copy MUST come from `useLocale()` and the translation dictionaries.

## 6. Layout, spacing, and surfaces

- Use the spacing scale from `--spacing-xs` through `--spacing-2xl`.
- The normal vertical gap between major page sections is `--spacing-xl`; related controls generally use `--spacing-sm` or `--spacing-md`.
- Use `.glass-panel` for the application's standard elevated surface.
- Use `.panel-no-padding` when a table or list owns its internal spacing and must reach the panel edges.
- Do not nest glass panels only for decoration. Nesting is acceptable when each surface represents a distinct interactive or informational group.
- Page-specific CSS MUST be scoped to its page or component. A convention used by every instance of a shared component belongs in that component's stylesheet, not in multiple page stylesheets.

## 7. Forms and controls

- Use the shared form classes and `CustomSelect`; do not introduce native selects with competing visuals unless required for accessibility or platform behavior.
- Labels MUST remain visible. Placeholders supplement labels and do not replace them.
- Related fields MAY share `.form-row`; they MUST stack at the established mobile breakpoint.
- One action name MUST remain consistent from button to confirmation or status message.
- Destructive actions MUST use danger semantics and require confirmation when they permanently remove user data.

## 8. Filters and search

- Transaction-like list pages SHOULD reuse `FilterTabs`.
- Frequently changed, high-level type filters belong in the visible tabs. Detailed filters belong in the filter modal.
- Modal filters MUST keep temporary values separate from active values. Changes take effect only through the Apply action.
- Reset MUST restore every detailed filter to that page's documented default.
- Active filters SHOULD be shown as compact labels with semantic icons.
- The active date period MUST be presented as the primary filter context with a visible label, strong value, and filter action. Payment method and category remain secondary compact labels.
- On mobile, the period adjustment action uses its icon-only variant with a translated accessible label to preserve space and hierarchy.
- Temporal filters are isolated in the page-level period panel and MUST offer Month, Year, and custom Period modes.
- Search and characteristic filters belong immediately before the table, list, or chart they affect. Their filter action opens a separate modal that does not contain date controls.
- Type tabs remain the first page control and use the standard major-section spacing. Period context cards do not add their own external margin.
- Filter modal action rows use `--spacing-lg` above Reset and Apply actions.
- Search and all active filters combine using logical AND unless a feature specification explicitly defines otherwise.

## 9. Tables and data-heavy content

- Desktop data tables SHOULD reuse `.data-table` and its semantic column/value classes.
- Numeric and currency columns MUST align to the right. Descriptive columns align to the left.
- Currency values MUST use the locale-aware formatter. Positive and negative meaning MUST use the existing success and danger semantics.
- On mobile, hide lower-priority columns or provide a dedicated card/summary presentation rather than compressing every desktop column.
- Table cells MUST retain enough internal padding for readability.
- When a table is nested inside a padded chart panel on mobile, the table wrapper MAY compensate for the panel's horizontal padding so the table uses the full panel width; cell padding MUST remain intact.
- Horizontal scrolling is a fallback for genuinely wide data, not a substitute for prioritizing mobile information.

## 10. Modals

- Use the shared `Modal` component for blocking forms, confirmations, and detailed filters.
- Modal titles MUST name the task or decision, not the implementation object.
- On desktop, modals remain centered. On mobile, they use the established bottom-sheet treatment.
- Primary actions appear last. Cancel or Reset appears before Apply, Save, Confirm, or Delete.
- Dialogs MUST preserve the shared focus visibility, accessible name, close label, scroll locking, and safe-area behavior.

## 11. Responsive behavior

- The canonical mobile breakpoint is `768px`: mobile rules use `max-width: 768px`, and desktop-only overrides begin at `769px`.
- New UI MUST be usable at narrow mobile widths without clipped actions, unreadable values, or unintended horizontal page scrolling.
- Use the shared `.hide-on-mobile` and `.hide-on-desktop` utilities for simple visibility changes.
- Desktop layouts MAY use denser grids. Mobile layouts MUST prioritize reading order and touch targets over preserving desktop geometry.
- Fixed mobile controls MUST respect `env(safe-area-inset-bottom)` where applicable.
- Main-destination app bars and secondary-page back-navigation bars remain sticky on mobile and MUST respect `env(safe-area-inset-top)`.
- Mobile route changes MUST reset page scroll when the pathname changes; filter-only query-string changes retain their position.
- Mobile surfaces disable text selection by default to prevent accidental gesture selection, while inputs, textareas, and editable content MUST retain native selection.

## 12. Accessibility and interaction

- Interactive elements MUST be semantic buttons, links, inputs, or controls with equivalent keyboard behavior.
- Icon-only actions MUST have a translated accessible label or title.
- Global focus-visible styles MUST not be removed without an accessible replacement.
- Do not communicate financial status by color alone; pair color with text, sign, label, or icon.
- Motion SHOULD be brief and purposeful. New non-essential motion MUST respect reduced-motion preferences.
- Mobile list cards use a subtle outward scale while held, rising above neighboring content without clipping at the list edges. When supported, a light haptic tick acknowledges touch-down and a stronger tick confirms completion of a long press.
- Asynchronous financial values MUST render structural skeletons while their authoritative source is loading; temporary zero values and empty states MUST NOT represent unknown data.
- Skeletons MUST approximate final geometry, expose a localized status to assistive technology, avoid semantic financial colors, and disable animation for reduced-motion preferences.

### 12.1 Temporary notifications

- Completed asynchronous create, update, confirm, delete, and import actions SHOULD use the shared global toast system when the result is not otherwise unmistakable.
- Toast copy MUST name the completed action, such as “Transaction created,” instead of using a generic “Saved successfully.”
- Desktop toasts appear at the top right. Mobile toasts appear centered at the top below the safe area so they do not conflict with bottom navigation, FABs, or the keyboard.
- Success toasts dismiss automatically after approximately three seconds. Error toasts remain longer and MUST provide a dismiss action.
- Toasts MUST pair semantic iconography with text, expose appropriate live-region semantics, show one queued message at a time, and respect reduced-motion preferences.
- Failed modal submissions MUST keep the modal open. Field-specific failures remain inline; a toast may summarize an operation-level failure.

## 13. Review checklist

Before completing a UI change, verify:

- The page type and back-button behavior follow Section 3.
- `PageHeader` and other shared components are reused where applicable.
- Heading order and page anatomy are consistent.
- All copy is translated in every supported locale.
- Tokens are used instead of new literal design values.
- Mobile and desktop behavior have both been considered.
- Tables, filters, modals, empty states, and destructive actions follow their relevant sections.
- Keyboard focus, accessible labels, semantic colors, and safe areas remain correct.
- A reusable new convention is documented here rather than duplicated across page styles.

## 14. Explainable financial aggregates

- A summary card MAY link to a nested breakdown page when the aggregate requires reconciliation.
- The breakdown MUST reuse the exact projection that calculates the source aggregate; it must not reproduce the business rule independently.
- Breakdown pages explain composition and MUST NOT present themselves as an alternative transaction history.
- The originating temporal context SHOULD be preserved in URL parameters so navigation, refresh, and sharing retain the same result.
- Groups MUST expose subtotals, and their rendered entries MUST reconcile exactly with the displayed aggregate.
