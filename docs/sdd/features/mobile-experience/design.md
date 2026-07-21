# Design: Mobile Experience Refinements

## 1. Overview
- **Purpose:** Align shared mobile interactions with the application's platform-aware interface.
- **Scope:** Shared modal CSS, PWA manifest metadata, authenticated layout navigation, and global responsive CSS.

## 2. Architecture

### 2.1 Modal presentation
At the canonical `768px` breakpoint, the shared modal keeps its top corners and side borders, removes the bottom border, and uses dedicated translate-only bottom-sheet entrance and exit animations. Entrance lasts 250 ms while exit uses a faster 150 ms response. The shared component retains the portal, frozen content, and scroll lock during its closing phase, then restores the document after the animation. Reopening during that phase cancels the pending removal. Reduced-motion users receive no transition delay or animation.

The modal body owns vertical scrolling and clips unintended horizontal overflow. Its direct children and transaction action-copy containers may shrink within the viewport so long labels wrap instead of widening the bottom sheet.

### 2.2 PWA metadata
The static Vite PWA manifest uses `Minhas Finanças` for both `name` and `short_name`. Manifest metadata cannot reliably follow the authenticated locale preference because installation metadata is fetched outside React state and may be cached by the browser.

### 2.3 Route scroll restoration
`Layout` observes `location.pathname`. On mobile pathname changes it synchronously scrolls the document to the top. Search-parameter-only filter changes retain their position.

### 2.4 Text selection
The global mobile stylesheet applies `user-select: none` to the document body and explicitly restores text selection for `input`, `textarea`, and editable content. Desktop behavior is unaffected.

### 2.5 Persistent mobile navigation headers
The primary app bar is sticky at the viewport top on main destinations. Secondary and nested pages use the shared `PageHeader` back-navigation row as their sticky app bar instead. Both surfaces use the opaque theme background without a divider so they visually continue the mobile status bar, respect the top safe area, preserve one standard spacing unit above their controls, and stay in document flow. Mobile `.main-content` keeps vertical overflow visible so the viewport remains the sticky scroll container. The large page title continues to scroll with content so narrow viewports retain useful vertical space. Static PWA and HTML theme colors use the light background; `ThemeContext` synchronizes them to the active light or dark background at runtime.

## 3. Verification
- Unit-test route scroll reset at mobile and desktop viewport sizes.
- Unit-test delayed modal removal, closing state, and rapid reopening.
- Verify sticky classes for primary and back-navigation mobile headers.
- Run the application test suite, lint, and production build.
