# Recurring Plan Reference Design

`planReferenceUtils` derives a deterministic six-character display reference from the source document ID. Virtual occurrences use `originalId`, so an entire recurring series retains one reference. Planning desktop rows, mobile cards, and recurring breakdown metadata display the translated reference. One-time plans retain only their existing financial context.
