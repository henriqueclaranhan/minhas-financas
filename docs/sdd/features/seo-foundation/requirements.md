# SEO Foundation Requirements

## User Story

As the product owner, I want public pages to expose accurate metadata directly in their server-delivered HTML so search engines can index the intended content without depending on client-side JavaScript.

## Acceptance Criteria

1. The public home document is indexable in its initial HTML response.
2. The privacy policy has dedicated static title, description, canonical, Open Graph, Twitter, language, and structured-data metadata.
3. Authenticated application routes remain non-indexable in their initial HTML response and continue to support direct navigation.
4. Unknown routes return a real HTTP 404 on Vercel and expose `noindex, nofollow`.
5. The obsolete keywords meta tag is not emitted.
6. The home `WebApplication` structured data includes the real locale, free-access state, image, and product feature information.
7. Sitemap entries include their latest relevant modification date.

## Constraints

- The existing React SPA and client-side authentication flow must remain unchanged.
- Public and private financial data must never be rendered into static documents.
- Route-specific documents must be derived from the production Vite output so hashed asset references remain valid.
