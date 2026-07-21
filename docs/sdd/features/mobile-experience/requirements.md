# Requirements: Mobile Experience Refinements

## Feature Overview
Refine shared mobile behavior for bottom-sheet modals, PWA installation metadata, route navigation, and accidental text selection.

## User Stories
- As a mobile user, I want dialogs to rise naturally from the bottom edge.
- As a PWA user, I want the installed application name to be readable.
- As a mobile user, I want each navigated page to start at the top.
- As a mobile user, I want gestures to interact with the interface without accidentally selecting labels.

## Acceptance Criteria
- [x] Mobile modal surfaces have no bottom border and enter vertically from below the viewport.
- [x] Reduced-motion preferences disable the mobile modal entrance animation.
- [x] The PWA full and short names are `Minhas Finanças`.
- [x] Client-side pathname changes reset the mobile document scroll position.
- [x] Mobile text selection is disabled globally except for text inputs, textareas, and editable content.
- [x] Desktop selection behavior remains unchanged.
- [x] Shared modals animate both entrance and exit on mobile before the portal is removed.
- [x] Modal content and document scroll locking remain stable until the exit animation completes.

## Constraints
- The installed PWA name is static manifest metadata and does not depend on authenticated application preferences.
- Form editing, keyboard focus, and assistive-technology semantics must remain intact.
