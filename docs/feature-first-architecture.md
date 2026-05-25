# Feature-first architecture (implemented)

## Goals
- Group code by feature ownership first.
- Keep cross-cutting concerns in `src/shared`.
- Keep routing/providers/layout concerns in `src/app`.

## Implemented structure

- `src/app/router`: route definitions and scroll behavior
- `src/app/providers`: app-level providers (includes traffic tracker bootstrap)
- `src/app/layouts`: app-level layout primitives
- `src/features/auth`: auth hooks, guards, and auth services
- `src/features/dashboard`: portfolio pages, item detail view, modal, and Firestore data access
- `src/features/admin`: admin page and write service
- `src/features/analytics`: analytics logging data layer, tracker hook, domain model, and admin analytics page
- `src/shared/components`: reusable UI components
- `src/shared/services/api`: generic API request client
- `src/shared/services/firebase`: Firebase app clients
- `src/shared/utils`: metadata/device helpers
- `src/shared/config`: environment parsing
- `src/shared/constants`: routes and collection names
- `src/shared/hooks`: reusable shared hooks
- `src/shared/layouts`: reusable shared layout components
- `src/shared/types`: shared typedefs

## Tracking limitations
- Browser environments do **not** expose personal account emails to websites by default.
- Email can only be captured when an authenticated session exists (for example Firebase Auth user present).
- IP address is **not** collected from client-side tracking in this implementation.

## Security model summary
- Portfolio reads are public.
- Portfolio writes are admin-only.
- Traffic log writes are schema-constrained.
- Traffic log reads are admin-only.
