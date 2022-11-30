# Adopt release:*labels to automate Changelog generation

- Status: accepted
- Deciders: Marco Basile
- Tags: release changelog labels

## Context
In the superseded ADR, it had been decided to automatically generate the changelog with a simple release-include/exclude labeling system. In order to generate a more useful changelog for our users, we committed to improve on this mechanism

## Decision
We are adopting the following labels for our PRs:

- release:breaking-change
- release:bugfix
- release:improvement
- release:feature
- release:deprecated

## Links
- Supersedes [20221107-adopt-github-labels-to-allow-automating-release-changelog-creation](20221107-adopt-github-labels-to-allow-automating-release-changelog-creation.md)
