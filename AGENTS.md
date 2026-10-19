# Architecture Rules

- Bound Posting Schedule reads with `withTimeout` and abort database reads on close or retry; failed reads must not become editable default schedules, to prevent overwriting saved times.