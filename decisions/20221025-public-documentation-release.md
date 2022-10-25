# Public documentation release

- Status: accepted
- Date: 2022-10-24

## Context
The [public documentation](https://pcluster.cloud/) is updated every time a new pull request is made. This is not always the desired behavior, especially when an amend is made to the documentation for unreleased ParallelCluster or ParallelCluster Manager features.

## Decision
Change the documentation workflow's trigger to run only on releases.

## Consequences
The documentation is updated only when ParallelCluster Mananager is released to customers. The downside is quick fixes to the documentation require more time to be released.
