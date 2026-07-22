# Desktop Sticky Page Header Design

## Structure

`PageHeader` renders the title and optional desktop action inside a dedicated `page-header-main` header. The optional description is a sibling paragraph, followed by the standard header-to-content spacing element. This separation allows the title row to become sticky without retaining the description.

## Responsive behavior

At the canonical desktop breakpoint (`min-width: 769px`), `.main-content` is constrained to the viewport height and remains the page's vertical scroll container. `page-header-main` uses sticky positioning at the top of that scrollport, the solid active-theme background, and a navigation-level stacking context. Because the scroll container owns `--spacing-xl` top padding, the sticky row extends the same non-interactive solid layer upward by that token; content passes behind a continuous opaque surface instead of appearing in a strip above the title. Below that breakpoint, `.main-content` returns to automatic height and the title remains in normal flow so the established mobile app bar and back-navigation behavior are unchanged.

## Verification

- Verify the title and action share the sticky header element.
- Verify the description is outside the sticky element.
- Run lint, focused component tests, and the production build.
