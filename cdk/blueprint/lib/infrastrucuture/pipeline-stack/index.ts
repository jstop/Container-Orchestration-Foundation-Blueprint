import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { IDatabaseCluster } from 'aws-cdk-lib/aws-rds';


interface PipelineStackProps extends cdk.StackProps {
    redisHostname: string;
    redisPort: string;
    rdsCluster: IDatabaseCluster;
    rdsSecretName: string;
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        const { redisHostname, redisPort, rdsCluster, rdsSecretName  } = props;

        //  create ECR Repo
        const ecrRepo = new ecr.Repository(this, 'EcrRepo',{
            repositoryName: 'springboot-multiarch'
        });

        //  create CodeCommit
        const codeCommitRepo = new Repository(this, "CodeCommitRepository",{
            repositoryName: 'springboot-multiarch'
        });

        // create code builds
        const arm_build = new codebuild.PipelineProject(this, 'arm_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/arm_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_ARM,
                privileged: true,
            },
            environmentVariables: {  
                'REPOSITORY_URI': { value: ecrRepo.repositoryUri },
                'REDIS_HOSTNAME': { value: redisHostname },
                'REDIS_PORT': { value: redisPort },
                'RDS_ENDPOINT': { value: rdsCluster.clusterEndpoint.hostname },
                'RDS_SECRET_NAME': { value: rdsSecretName },
            }
        });

        const amd_build = new codebuild.PipelineProject(this, 'amd_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/amd_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
                privileged: true,
            },
            environmentVariables: {  
                'REPOSITORY_URI': {
                    value: ecrRepo.repositoryUri
                }
            }
        });
        const post_build = new codebuild.PipelineProject(this, 'post_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/post_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
                privileged: true,
            },
            environmentVariables: {  
                'REPOSITORY_URI': {
                    value: ecrRepo.repositoryUri
                }
            }
        });

        // create pipeline
        const source_artifact = new codepipeline.Artifact();
        const arm_build_artifact = new codepipeline.Artifact("ArmBuildOutput");
        const amd_build_artifact = new codepipeline.Artifact("AmdbuildOutput");
        const post_build_artifact = new codepipeline.Artifact("PostBuildOutput");


        const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.CodeCommitSourceAction({
                            actionName: 'CodeCommit',
                            repository: codeCommitRepo,
                            output: source_artifact,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'arm_build',
                            project: arm_build,
                            input: source_artifact,
                            outputs: [arm_build_artifact],
                        }),
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
    }
}
