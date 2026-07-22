# Desktop Sticky Page Header Requirements

## User story

As a desktop web user, I want the current page title and its primary action to remain available while I scroll, without spending persistent space on supporting copy.

## Acceptance criteria

- [x] At widths of 769 px and above, the shared page title row remains visible while its page content scrolls.
- [x] The desktop primary action remains in the same sticky row as the title.
- [x] The page description remains in normal document flow and scrolls away.
- [x] Mobile retains its current navigation-header behavior and its large page title remains non-sticky.
- [x] The sticky row uses the active theme background and existing spacing tokens.
- [x] The desktop content region is the bounded viewport scroll container required by sticky positioning, while mobile retains document scrolling.
