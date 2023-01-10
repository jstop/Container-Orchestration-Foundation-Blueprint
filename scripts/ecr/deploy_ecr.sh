#!/bin/sh
source ../aws_variables.sh
# Change the values of these constants to suit your project
STACK_NAME=EKSClusterPipelineBlueprint-ECRRepo
REPO_NAME=ekscluster-pipeline-blueprint

# Recommend not changing these constants
TEMPLATE=../../cloudformation/ecr.yml


echo Preparing to deploy images template

echo Linting...
cfn-lint "$TEMPLATE"

echo Deploying...
aws cloudformation --profile $AWS_PROFILE deploy \
    --template-file "$TEMPLATE" \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        RepositoryName="$REPO_NAME"
