# Requirements: Not Found Page

## Feature Overview
Provide a clear recovery screen when a user opens an application URL that does not match a registered route.

## User Stories
- As a user, I want to understand that the requested page does not exist so that I can recover without confusion.
- As a user, I want a direct action back to the application home so that I can continue using the product.

## Acceptance Criteria
- [x] Unknown authenticated and public routes display a dedicated 404 page.
- [x] The page provides a translated action that navigates to `/`.
- [x] The page is responsive and supports light and dark themes through existing tokens.
- [x] The page uses one visible `h1` and an accessible decorative icon treatment.

## Edge Cases / Constraints
- The Vercel SPA rewrite must continue serving `index.html`; route matching remains the responsibility of React Router.
- The authenticated version may render inside the application layout, while the public version must work without that layout.

