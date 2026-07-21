# Requirements: Mobile Experience Refinements

## Feature Overview
Refine shared mobile behavior for bottom-sheet modals, PWA installation metadata, route navigation, and accidental text selection.

## User Stories
- As a mobile user, I want dialogs to rise naturally from the bottom edge.
- As a PWA user, I want the installed application name to be readable.
- As a mobile user, I want each navigated page to start at the top.
- As a mobile user, I want gestures to interact with the interface without accidentally selecting labels.
- As a PWA user, I want to refresh current financial data with a familiar pull gesture.

## Acceptance Criteria
- [x] Mobile modal surfaces have no bottom border and enter vertically from below the viewport.
- [x] Reduced-motion preferences disable the mobile modal entrance animation.
- [x] The PWA full and short names are `Minhas Finanças`.
- [x] Client-side pathname changes reset the mobile document scroll position.
- [x] Mobile text selection is disabled globally except for text inputs, textareas, and editable content.
- [x] Desktop selection behavior remains unchanged.
- [x] Shared modals animate both entrance and exit on mobile before the portal is removed.
- [x] Modal content and document scroll locking remain stable until the exit animation completes.
- [x] The primary app header remains visible while scrolling main destinations on mobile.
- [x] The back-navigation header remains visible while scrolling secondary and nested pages on mobile.
- [x] Sticky mobile headers respect the top safe area without making the large page title persistent.
- [x] Sticky headers use an opaque active-theme background continuous with the mobile status bar.
- [x] Mobile content does not create a competing overflow container that prevents sticky back navigation.
- [x] Sticky mobile headers blend into the page without a bottom divider.
- [x] Mobile modal bodies do not expose horizontal scrolling when forms or action descriptions approach the viewport width.
- [x] Pull-to-refresh is available only in installed standalone PWA mode when the document is already at the top.
- [x] The pull gesture shows localized pull, release, and refreshing feedback.
- [x] Pull-to-refresh ignores predominantly horizontal gestures, editable controls, open modals, and the open mobile drawer.
- [x] Reduced-motion preferences disable the refresh spinner animation.

## Constraints
- The installed PWA name is static manifest metadata and does not depend on authenticated application preferences.
- Form editing, keyboard focus, and assistive-technology semantics must remain intact.
