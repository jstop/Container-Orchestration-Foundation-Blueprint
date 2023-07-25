#!/usr/bin/env bash

# This script is used to delete the images from the ECR repository, so that the ECR repository is empty and can be deleted through CloudFormation.

REPO_NAME=$1

image_digests=$(aws ecr list-images --repository-name $REPO_NAME --query 'imageIds[].imageDigest' --output text --no-cli-pager)

if [ -z "$image_digests" ]; then
    echo "No images found in ECR repository."
    exit 0
fi

digests_string=""
for image_digest in $image_digests; do
    digests_string+="imageDigest=$image_digest "
done
digests_string=$(echo $digests_string | sed 's/ $//')

echo "Deleting images from ECR repository... \n$digests_string".

aws ecr batch-delete-image --repository-name $REPO_NAME --image-ids $digests_string --no-cli-pager
