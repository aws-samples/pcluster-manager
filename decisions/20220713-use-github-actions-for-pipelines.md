# Use Github Actions for pipelines

- Status: accepted
- Deciders: Mattia Franchetto, Alessandro Menduni, Marco Basile
- Date: 7/12/2022

## Context
PCluster Manager doesn't have a pipeline to run tests of different kinds (unit, integration and so on) in a continuous integration fashion, and optionally deliver the tested changes automatically.

## Decision
Pipelines will be built on top of Github Actions because it's fast, simple to configure using YAML files, immediately available and free for open source projects.
A solution like AWS CodeBuild has been discarded for the moment for its complex setup, but may be used in the future.

## Consequences
The pipeline will perform tests on every pull request: if we fail to configure it properly the code won't get merged until the pipeline is restored with manual actions (like restarting the job or tweak the configuration), but this is a common scenario regardless of the tool being used.

## Links
- [Actions](https://docs.github.com/en/actions)
