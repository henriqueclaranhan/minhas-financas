# Requirements: Toast Feedback

## Feature Overview
Provide clear, temporary feedback after asynchronous create, update, confirmation, deletion, import, and profile actions without forcing users to inspect the underlying list for confirmation.

## User Stories
- As a user, I want confirmation after a financial action finishes so I know it was saved.
- As a mobile user, I want feedback that does not overlap bottom navigation, floating actions, or the keyboard.
- As an assistive-technology user, I want status and error messages announced with the appropriate urgency.

## Acceptance Criteria
- [ ] A global provider exposes success and error notifications from any authenticated or unauthenticated route.
- [ ] Desktop notifications appear at the top right.
- [ ] Mobile notifications appear centered at the top below the safe area.
- [ ] Success notifications dismiss automatically after three seconds.
- [ ] Error notifications remain longer and can be dismissed manually.
- [ ] Notifications include semantic iconography and text, never color alone.
- [ ] Success uses a polite live region; errors use alert semantics.
- [ ] Multiple notifications are queued and displayed one at a time.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] All copy is available in Portuguese and English.
- [ ] A failed modal submission keeps the modal open.

## Out of Scope
- Push notifications, browser notifications, and persisted notification history.
- Undoing destructive operations from a toast.
