# SEO Foundation Design

## Overview

The Vite build emits the regular `index.html`, then a dependency-free post-build script derives three route-specific documents from it:

- `index.html`: public home, `index, follow`, canonical home metadata, and `WebApplication` JSON-LD.
- `privacy.html`: public privacy policy metadata and `WebPage` JSON-LD.
- `app.html`: private SPA entry document with `noindex, nofollow`.
- `404.html`: client-rendered not-found page with static noindex metadata; Vercel serves it with HTTP 404 when no file or rewrite matches.

Vercel rewrites only the known client-side application routes to `app.html` and `/privacidade` to `privacy.html`. Removing the catch-all rewrite allows the platform's static 404 behavior to return the correct status for unknown paths.

## Metadata Ownership

`index.html` remains the source template for shared metadata. `scripts/generate-static-pages.mjs` owns production-only route variants. `SeoManager` remains responsible for keeping metadata synchronized after client-side authentication and locale changes.

## Verification

- Unit-test the static page generator using temporary directories.
- Build the application and inspect all four generated documents.
- Run the existing test and lint suites.
