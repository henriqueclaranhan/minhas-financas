# Custom Select Upward Positioning Design

`CustomSelect` continues to render its menu through the document-body portal. When available space selects the upward branch, the fixed style sets `top: auto` before anchoring with `bottom`. The downward branch symmetrically sets `bottom: auto` before anchoring with `top`. This keeps the shared menu compatible with its base CSS and fixes every form that opens a select near the viewport edge without introducing page-specific layout rules.

Verification renders the shared component with a trigger near the bottom edge, opens it, asserts the cleared top coordinate, and selects an option through the portal.

