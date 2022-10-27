# Export PCluster Manager logs from CloudWatch

- Status: accepted
- Deciders: Nuraghe team
- Date: 2022-10-27
- Tags: cloudwatch, logging, s3

## Context
Customers need a way to easily export their PCluster Manager deployment logs in order to provide the support team
with the info needed to get help. Right now there is no way from the PCM UI to be guided in performing the
necessary actions to download log files produced by the application.
Since a complete automation and a 1-click experience are not feasible right now with what we have, we cannot provide
customers with an immediate way to get logs and some manual process would still be necessary,
(pre-signed URL for S3 are only possible for single objects and not collection of objects), so right now we decided to
skip the automation part entirely.

## Decision
Guide the users with documentation links and/or instructions on how to perform an [export to s3 action](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/S3ExportTasks.html)
letting them know what is needed and how to download log archives.

## Consequences
Helping customers solve their issues will become easier and more manageable,
although part of the manual process may be error-prone for users less acquainted with AWS console.
