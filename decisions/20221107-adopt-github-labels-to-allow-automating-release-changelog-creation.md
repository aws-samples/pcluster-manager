# Adopt Github labels to allow automating release changelog creation

- Status: superseded by [20221129-adopt-releaselabels-to-automate-changelog-generation](20221129-adopt-releaselabels-to-automate-changelog-generation.md)
- Deciders: Nuraghe team
- Date: 2022-11-07
- Tags: release, changelog, labels

## Context
The creation of a release changelog is a manual process involving the repetition of a few steps.
All pull requests need to be checked from the previous release to the latest commit target of the code freeze.
While manually reviewing PRs we also need to sort them in one of multiple lists, like "Bugfixes", "New features", etc.
This is a pretty long process and error-prone, since to the human eye things get lost easily.

## Decision
We are adopting a simple labeling strategy to select which PRs are worthy of being mentioned in the changelog.
Right now only two labels exist:

- release-include (to include the target PR in the generated changelog in a section named "Features")
- release-exclude (to explicitly exclude the target PR from the generated changelog)

Other tags that cause the PR to be excluded are:

- DON'T MERGE
- duplicate 
- invalid 
- question 
- wontfix

## Commitment
We commit to two things:

- to write better PR titles if the PR is intended to be included in the generated changelog
- (after a first test with the next release) to use more labels of the likes of:

  - release:breaking-change 
  - release:bugfix 
  - release:improvement 
  - release:feature

To include the PR in a separate section of the generated changelog

## Consequences
What becomes easier or more difficult to do because of this change?

## Links
- [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
