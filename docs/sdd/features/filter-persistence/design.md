# Design: Filter Persistence

## Architecture
- `useTemporalFilter` reads applied period values from `useSearchParams` and writes them atomically on Apply.
- `useQueryParamState` validates and synchronizes page-specific scalar filters.
- Category Expenses maps its month/range filter directly to query parameters.
- List pages encode type, category, and payment-method values; Forecast encodes non-default projection toggles.
- Temporary modal state remains separate and is copied to the URL only by Apply or Reset.

## URL Contract
Temporal filters use `mode`, `year`, `month`, `start`, and `end`. Page-specific filters use descriptive parameters such as `type`, `category`, `method`, `plannedIncome`, and `plannedExpense`. Default scalar values are omitted where possible. No filter state is stored in local storage.
