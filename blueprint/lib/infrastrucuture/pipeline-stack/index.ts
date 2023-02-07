import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import { IDatabaseCluster } from 'aws-cdk-lib/aws-rds';


interface PipelineStackProps extends cdk.StackProps {
    rdsCluster: IDatabaseCluster;
    rdsSecretName: string;
    pipelineName: string;
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        const { rdsCluster, rdsSecretName, pipelineName  } = props;

        //  create ECR Repo
        const ecrRepo = new ecr.Repository(this, 'EcrRepo',{
            repositoryName: pipelineName
        });

        //  create CodeCommit
        const codeCommitRepo = new Repository(this, "CodeCommitRepository",{
            repositoryName: pipelineName
        });

        // create code builds
        const arm_build = new codebuild.PipelineProject(this, 'arm_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/arm_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_ARM,
                privileged: true,
            },
            environmentVariables: {  
                'DOCKERHUB_USERNAME': { value: 'vrlabs' },
                'REPOSITORY_URI': { value: ecrRepo.repositoryUri },
                'RDS_ENDPOINT': { value: rdsCluster.clusterEndpoint.hostname },
                'RDS_SECRET_NAME': { value: rdsSecretName },
                'REACT_APP_API_BASE_URL': { value: 'https://polling-api.verticalrelevancelabs.com/api' },
            }
        });
        const arm_build_role = arm_build.role as iam.Role;
        arm_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'));
        arm_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'));

        const amd_build = new codebuild.PipelineProject(this, 'amd_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/amd_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
                privileged: true,
            },
            environmentVariables: {  
                'DOCKERHUB_USERNAME': { value: 'vrlabs' },
                'REPOSITORY_URI': { value: ecrRepo.repositoryUri },
                'REACT_APP_API_BASE_URL': { value: 'https://polling-api.verticalrelevancelabs.com' },
            }
        });
        //add managed policy to codebuild role
        const amd_build_role = amd_build.role as iam.Role;
        amd_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'));
        amd_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'));

        const post_build = new codebuild.PipelineProject(this, 'post_build', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec/post_build.yml'),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
                privileged: true,
            },
            environmentVariables: {  
                'REPOSITORY_URI': { value: ecrRepo.repositoryUri },
                'RDS_ENDPOINT': { value: rdsCluster.clusterEndpoint.hostname },
                'RDS_SECRET_NAME': { value: rdsSecretName },
            }
        });
        const post_build_role = post_build.role as iam.Role;
        post_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'));
        post_build_role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'));
        post_build_role.addToPolicy(new iam.PolicyStatement({
            actions: ['eks:DescribeCluster', 'eks:DescribeNodegroup','eks:DescribeUpdate'],
            resources: ['*']
        }));
        
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
                            branch: 'main',
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
