#!/bin/bash
REPO="parallelcluster-ui"
DIGEST=$(aws ecr describe-images --repository-name "${REPO}" \
--query 'sort_by(imageDetails,& imagePushedAt)[-2].[imageDigest][0]')
MANIFEST=$(aws ecr batch-get-image --repository-name "${REPO}" --image-ids imageDigest="${DIGEST}" | jq --raw-output --join-output '.images[0].imageManifest')
aws ecr put-image --repository-name "${REPO}" --image-tag latest --image-manifest "${MANIFEST}"