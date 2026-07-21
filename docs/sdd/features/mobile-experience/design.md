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

### 2.6 Pull-to-refresh
`PullToRefresh` is mounted once by the authenticated layout. It activates only when the display mode is standalone (including the iOS standalone flag), the document is at the top, and the gesture begins outside editable controls, modals, and the open drawer. A resisted vertical distance drives a fixed safe-area-aware status pill; crossing the threshold and releasing performs a full reload so the service worker shell and Firebase providers initialize through the normal application lifecycle. Horizontal or upward gestures are abandoned. Reduced-motion users retain state feedback without spinner motion.

### 2.7 PWA launch screen
Android derives its launch screen from the web app manifest, whose `theme_color` and `background_color` both match the light application background. iOS receives `apple-touch-startup-image` metadata for current portrait iPhone and iPad viewport families at their native pixel densities, with light and dark variants selected through `prefers-color-scheme`. Each committed asset uses the existing green finance mark, the static product name in Outfit, and the corresponding application background. Startup images are precached by the existing Workbox PNG glob.

### 2.8 Mobile list-card press feedback
Transaction and planning list cards reuse the long-press hook for a light haptic tick at touch start and a stronger confirmation when the action sheet opens. Haptics remain capability-gated through the Vibration API. While held, the card scales outward above neighboring content using the shared fast transition, elevated stacking, visible overflow through the card and its mobile list panel, and reserved list-edge space that prevents clipping. Desktop table panels retain clipped overflow, and reduced-motion preferences disable the transform.

### 2.9 Responsive navigation shell
`Layout` owns one translated navigation model for desktop links, mobile secondary links, and the bottom navigation subset. Both desktop and mobile drawer instantiate the shared `AppSidebar`, whose internal `NavigationLinks` implementation owns route markup, active states, labels, and navigation callbacks; viewport variants change only the surrounding presentation and which routes complement the mobile bottom bar. Desktop toggles between a 320 px full sidebar and an 88 px icon rail. The collapse control sits immediately after Settings and becomes a centered icon control in the rail. Every desktop section uses the same 16 px gutter and 56 px icon column: route items retain a fixed 46 px height regardless of label visibility or active font weight, the brand mark remains in that column in both states while its expanded title is independently centered, and the user card keeps a fixed 56 px height, padding, and avatar alignment. These stable dimensions allow sidebar, card, and item widths to animate with the shared transition while labels cross-fade without moving the icon column. Reduced-motion preferences disable all sidebar state transitions. The preference is stored locally under `desktop-sidebar-collapsed`. Mobile retains an overlay presentation because it serves a different touch role, while its app bar uses the same product mark and display typography. Drawer user identity is a shrinkable single-line region: long names truncate with an ellipsis while the avatar and close action retain their sizes.

## 3. Verification
- Unit-test route scroll reset at mobile and desktop viewport sizes.
- Unit-test delayed modal removal, closing state, and rapid reopening.
- Verify sticky classes for primary and back-navigation mobile headers.
- Unit-test standalone detection, threshold behavior, and gesture exclusions for pull-to-refresh.
- Verify that every declared iOS startup image exists and that production build precaching includes splash PNG assets.
- Unit-test desktop sidebar collapse, expansion, and local preference persistence.
- Run the application test suite, lint, and production build.
