import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';

interface PipelineStackProps extends cdk.StackProps {
    pipelineName: string;
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        const { pipelineName } = props;

        //  create ECR Repo
        const ecrRepo = new ecr.Repository(this, 'EcrRepo',{
            repositoryName: pipelineName
        });

        //  create CodeCommit
        const codeCommitRepo = new Repository(this, "CodeCommitRepository",{
            repositoryName: pipelineName
        });

        // create code builds
        const amd_build = new codebuild.PipelineProject(this, 'amd_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/amd_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
                privileged: true,
            },
            environmentVariables: {
                'REPOSITORY_URI': { value: ecrRepo.repositoryUri },
                'REACT_APP_API_BASE_URL': { value: 'https://polling-api.verticalrelevancelabs.com' },
            }
        });
        //add managed policy to codebuild role
        const amd_build_role = amd_build.role as iam.Role;
        amd_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'));

        const post_build = new codebuild.PipelineProject(this, 'post_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/post_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
                privileged: true,
            },
            environmentVariables: {  
                'REPOSITORY_URI': { value: ecrRepo.repositoryUri },
            }
        });
        const post_build_role = post_build.role as iam.Role;
        post_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'));
        
        // create pipeline
        const source_artifact = new codepipeline.Artifact();
        const amd_build_artifact = new codepipeline.Artifact("AmdbuildOutput");
        const post_build_artifact = new codepipeline.Artifact("PostBuildOutput");

        new codepipeline.Pipeline(this, 'Pipeline', {
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.CodeCommitSourceAction({
                            actionName: 'CodeCommit',
                            repository: codeCommitRepo,
                            branch: 'main',
                            output: source_artifact,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'amd_build',
                            project: amd_build,
                            input: source_artifact,
                            outputs: [amd_build_artifact],
                        }),
                    ],
                },
                {
                    stageName: 'Deploy',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'post_build',
                            project: post_build,
                            input: source_artifact,
                            outputs: [post_build_artifact],
                        }),
                    ],
                },
            ],
        });

        new cdk.CfnOutput(this, 'ECRRepoURI', {
            value: ecrRepo.repositoryUri,
            description: 'ECR Repository URI',
        });
    }
}
