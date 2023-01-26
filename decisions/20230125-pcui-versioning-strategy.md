# PCUI Versioning strategy

- Status: accepted
- Deciders: Nuraghe Team
- Tags: versioning, pcui

## Context
We want to avoid confusion for customers using PC UI and Parallel Cluster.
So we need to keep PC UI and PC versioning schemas separated.
While PC keeps their semver-like schema, PC UI switches do a year.month[.revision] schema.


## Decision
Using the format YYYY.MM[.REVISION] for PC UI versions, where 

- YYYY is the full year in which PC UI gets released
- MM is the two digit number for the month in which PC UI gets released
- REVISION is an optional value to allow separation of patches between the same major version

