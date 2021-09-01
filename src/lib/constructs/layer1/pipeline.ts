import * as cdk from '@aws-cdk/core';
import {BuildkiteCfnProvider} from './provider';
import {PipelineHandler, PipelineResourceProps} from '../../../handler/resources/pipeline';

export interface CfnBuildkitePipelineProps {
  readonly provider: BuildkiteCfnProvider;
  readonly organization: string;
  readonly repository: string;
  readonly configuration: string;

  readonly pipelineName?: string;
  readonly removalPolicy?: cdk.RemovalPolicy;
}

export class CfnBuildkitePipeline extends cdk.CustomResource {
  constructor(scope: cdk.Construct, id: string, props: CfnBuildkitePipelineProps) {
    const resProps: PipelineResourceProps = {
      ServiceToken: props.provider.serviceToken,
      PipelineName: props.pipelineName ? props.pipelineName : scope.node.path,
      Organization: props.organization,
      RepositoryURL: props.repository,
      YAMLSteps: props.configuration,
    };

    super(scope, id, {
      serviceToken: props.provider.serviceToken,
      resourceType: PipelineHandler.RESOURCE_TYPE,
      removalPolicy: props.removalPolicy,
      properties: resProps,
    });
  }
}
