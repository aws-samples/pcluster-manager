# Support multiple versions of PC API

- Status: accepted
- Date: 2022-10-27
- Tags: feature-flags, pc-api

## Context
Both the UI and the generated YAML need to change according to version of the PC api the customer is using. There is no central point where all the features we support are listed and it is getting hard to keep track of all the moving parts whenever a new version of the PC api is released

## Decision
Use feature flags to toggle on and off features. Generate the list of active flags based on the current version of the PC api.

## Consequences
- Upside: We have a single point where every feature is listed, and a single map to manage which feature maps to which version.
- Downside: We still have to maintain different UIs and it may get very hard to test every combination of features in the long run.