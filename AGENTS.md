# Architecture Rules

- Bound Posting Schedule reads with `withTimeout` and abort database reads on close or retry; failed reads must not become editable default schedules, to prevent overwriting saved times.
- Reference-image dialogs use the local session for owner-scoped reads, bound and abort requests on close or retry, and distinguish loading failures from empty galleries so saved images are not hidden behind endless loading.