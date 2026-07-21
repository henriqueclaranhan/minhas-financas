# Design: Toast Feedback

## Architecture
- `ToastProvider` owns a FIFO queue and exposes `success`, `error`, and `dismiss` actions through `useToast`.
- `ToastViewport` renders the first queued item in a body portal so modal stacking does not clip it.
- `FinanceContext` emits translated action-specific feedback around service mutations and rethrows failures so modal ViewModels only close on success.
- Non-finance flows may call `useToast` directly from their ViewModel.

## Visual Direction
- Reuse the current translucent surface, border, shadow, typography, spacing, radii, and semantic color tokens.
- Use a narrow semantic leading rail plus a matching icon as the identifying detail.
- Desktop placement: top right with a constrained readable width.
- Mobile placement: top center, full available width minus standard margins, offset by `env(safe-area-inset-top)`.

## Behavior and Accessibility
- Show one toast at a time and preserve insertion order.
- Success duration is 3,000 ms; error duration is 6,000 ms.
- Pause dismissal while the pointer is over the toast or keyboard focus is inside it.
- Success uses `role="status"` and `aria-live="polite"`; error uses `role="alert"` and `aria-live="assertive"`.
- The close action is a translated semantic button.
- Entry and exit motion use existing transition timing and are removed when reduced motion is requested.

## Error Flow
Service errors produce a concise translated error toast and remain rejected. Existing modal handlers close only after the awaited mutation succeeds, so failures retain the user's form context.
