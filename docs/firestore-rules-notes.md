# Firestore Access Notes (Generated during refactor)

## Collections in use
- `projects`
- `experience`
- `education`
- `trafficLogs`
- `appConfig`

## Client operations
- Public portfolio reads: `orderBy(sortDate, desc)` on portfolio collections.
- Portfolio detail reads: direct `get` by document id.
- Admin writes: create/update/delete across portfolio collections.
- Portfolio image crop preference: optional `imagePosition` string on portfolio documents, saved from the edit modal and validated as CSS-style percentages.
- Traffic logging: anonymous or authenticated `create` into `trafficLogs`.
- Analytics dashboard (admin): query `trafficLogs` by `orderBy(createdAt, desc)` and `limit()`.
- Visitor alert settings: admin-only read/write of `appConfig/visitorAlerts`.

## Auth patterns
- Firebase Auth optional for normal visitors.
- Admin access derived from the allowlisted owner email.
- Analytics reads are admin-only.
- Visitor alert settings reads and writes are admin-only.
