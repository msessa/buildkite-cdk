import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cr from '@aws-cdk/custom-resources';
import * as lambdanodejs from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import {PipelineResourceProps} from '../../cfn-handlers/main';

export interface CfnBuildkitePipelineProps {
  readonly apiTokenSecret: secretsmanager.ISecret;
  readonly orgSlug: string;

  readonly pipelineName: string;
  readonly repository: string;
  readonly configuration: string;
}

interface BuildkitePipelineCustomResourceProps {
  readonly serviceToken: string;
  readonly properties: PipelineResourceProps;
}

export class BuildkitePipelineCustomResource extends cdk.CustomResource {
  constructor(scope: cdk.Construct, id: string, props: BuildkitePipelineCustomResourceProps) {
    super(scope, id, {
      serviceToken: props.serviceToken,
      resourceType: 'Custom::BK-Pipeline',
      properties: props.properties,
    });
  }
}

export class CfnBuildkitePipeline extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: CfnBuildkitePipelineProps) {
    super(scope, id);

    const onEventFunc = new lambdanodejs.NodejsFunction(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '../../cfn-handlers/main.js'),
      handler: 'on_event',
      timeout: cdk.Duration.seconds(15),
    });

    // Give access to the SecretsManager Secret containing the API Token
    props.apiTokenSecret.grantRead(onEventFunc.role!);

    const buildkitePipelineProvider = new cr.Provider(this, 'Provider', {
      onEventHandler: onEventFunc,
    });

    // new BuildkitePipelineCustomResource(this, 'Resource', {
    //   serviceToken: buildkitePipelineProvider.serviceToken,
    //   properties: {
    //     ServiceToken: buildkitePipelineProvider.serviceToken,
    //     Organization: 'service-victoria',
    //     ApiTokenSecretArn: props.apiTokenSecret.secretArn,
    //     PipelineName: props.pipelineName,
    //     RepositoryURL: props.repository,
    //     YAMLSteps: props.configuration,
    //   },
    // });
  }
}
