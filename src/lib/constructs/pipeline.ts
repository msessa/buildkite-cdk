import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cr from '@aws-cdk/custom-resources';
import * as lambdanodejs from '@aws-cdk/aws-lambda-nodejs';

export interface CfnBuildkitePipelineProps {
  readonly pipelineName: string;
  readonly repository: string;
  readonly configuration: string;
}

export class CfnBuildkitePipeline extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: CfnBuildkitePipelineProps) {
    super(scope, id);

    const onEventFunc = new lambdanodejs.NodejsFunction(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    const buildkitePipelineProvider = new cr.Provider(this, 'Provider', {
      onEventHandler: onEventFunc,
    });

    new cdk.CustomResource(this, 'Resource', {
      serviceToken: buildkitePipelineProvider.serviceToken,
      resourceType: 'Custom::BK-Pipeline',
      properties: {
        name: props.pipelineName,
        repository: props.repository,
        configuration: props.configuration,
      },
    });
  }
}
