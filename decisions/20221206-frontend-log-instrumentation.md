# Frontend log instrumentation

- Status: accepted
- Deciders: Nuraghe team
- Tags: logs, frontend

## Context
Right now we only have a remote logger implementation that pushes logs to the backend.
We want to also log stacktraces but without source-maps it would be hard for those stacktraces
to be actually useful/readable.

## Decision
Since our logger implementation provides an `extra` parameter for additional info to add to the log entry, we will:

- make an effort to log clear and effective messages that are actually useful when read by a developer/technician
- continuously look for ways to improve our existing logging calls when needed
- optionally leverage the `extra` parameter that to provide contextual information about where the log entry is being logged from

## Consequences
We get the ability to have effective logs available for inspection in case it's needed.

## Useful Links
- [Owasp Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [9 best practices for logging](https://www.atatus.com/blog/9-best-practice-for-application-logging-that-you-must-know/#9-logging-and-monitoring-best-practices)
- [13 best practices for logging](https://www.dataset.com/blog/the-10-commandments-of-logging/)