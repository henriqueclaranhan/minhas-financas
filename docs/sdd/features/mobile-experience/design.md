# Design: Mobile Experience Refinements

## 1. Overview
- **Purpose:** Align shared mobile interactions with the application's platform-aware interface.
- **Scope:** Shared modal CSS, PWA manifest metadata, authenticated layout navigation, and global responsive CSS.

## 2. Architecture

### 2.1 Modal presentation
At the canonical `768px` breakpoint, the shared modal keeps its top corners and side borders, removes the bottom border, and uses a dedicated translate-only bottom-sheet entrance. Reduced-motion users receive no entrance animation.

### 2.2 PWA metadata
The static Vite PWA manifest uses `Minhas Finanças` for both `name` and `short_name`. Manifest metadata cannot reliably follow the authenticated locale preference because installation metadata is fetched outside React state and may be cached by the browser.

### 2.3 Route scroll restoration
`Layout` observes `location.pathname`. On mobile pathname changes it synchronously scrolls the document to the top. Search-parameter-only filter changes retain their position.

### 2.4 Text selection
The global mobile stylesheet applies `user-select: none` to the document body and explicitly restores text selection for `input`, `textarea`, and editable content. Desktop behavior is unaffected.

## 3. Verification
- Unit-test route scroll reset at mobile and desktop viewport sizes.
- Run the application test suite, lint, and production build.
