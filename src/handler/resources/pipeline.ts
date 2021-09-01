import * as api from '../codegen/buildkite-api/api';
import {
  CloudFormationCustomResourceCreateEvent,
  CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceResponse,
  CloudFormationCustomResourceUpdateEvent,
} from 'aws-lambda';
import {assertParamIsDefined} from '../utils';

export interface PipelineResourceProps {
  ServiceToken: string;
  Organization: string;
  RepositoryURL: string;
  YAMLSteps: string;
  PipelineName: string;
}

export interface PipelineResourceCreateEvent extends CloudFormationCustomResourceCreateEvent {
  ResourceProperties: PipelineResourceProps;
}
export interface PipelineResourceUpdateEvent extends CloudFormationCustomResourceUpdateEvent {
  ResourceProperties: PipelineResourceProps;
}
export interface PipelineResourceDeleteEvent extends CloudFormationCustomResourceDeleteEvent {
  ResourceProperties: PipelineResourceProps;
}
export type PipelineResourceEvent =
  | PipelineResourceCreateEvent
  | PipelineResourceUpdateEvent
  | PipelineResourceDeleteEvent;

export class PipelineHandler {
  static RESOURCE_TYPE = 'Custom::Buildkite-Pipeline';

  private readonly event: PipelineResourceEvent;
  private readonly props: PipelineResourceProps;
  private readonly client: api.Sdk;

  constructor(client: api.Sdk, event: PipelineResourceEvent) {
    this.props = {
      ServiceToken: assertParamIsDefined('ServiceToken', event.ResourceProperties.ServiceToken),
      Organization: assertParamIsDefined('Organization', event.ResourceProperties.Organization),
      PipelineName: assertParamIsDefined('PipelineName', event.ResourceProperties.PipelineName),
      RepositoryURL: assertParamIsDefined('RepositoryURL', event.ResourceProperties.RepositoryURL),
      YAMLSteps: assertParamIsDefined('YAMLSteps', event.ResourceProperties.YAMLSteps),
    };
    this.event = event;
    this.client = client;
  }

  public async on_create(): Promise<Partial<CloudFormationCustomResourceResponse>> {
    // Retrieve the organisation ID
    let orgId: string;
    try {
      const orgDetResp = await this.client.GetOrganizationDetails({slug: this.props.Organization});
      orgId = orgDetResp.organization!.id;
    } catch (err) {
      throw new Error(`error querying buildkite for organization details: ${err}`);
    }

    const createPipelineResp = await this.client.CreatePipeline({
      pipelineName: this.props.PipelineName,
      orgId: orgId,
      repositoryUrl: this.props.RepositoryURL,
      yamlSteps: this.props.YAMLSteps,
    });

    return {
      PhysicalResourceId: createPipelineResp.pipelineCreate!.pipeline.id,
    };
  }

  public async on_update(physicaleResId: string): Promise<Partial<CloudFormationCustomResourceResponse>> {
    const updatePipelineResp = await this.client.UpdatePipeline({
      pipelineId: physicaleResId,
      pipelineName: this.props.PipelineName,
      repositoryUrl: this.props.RepositoryURL,
      yamlSteps: this.props.YAMLSteps,
    });

    return {
      PhysicalResourceId: updatePipelineResp.pipelineUpdate!.pipeline.id,
    };
  }

  public async on_delete(physicaleResId: string): Promise<Partial<CloudFormationCustomResourceResponse>> {
    const deletePipelineResp = await this.client.DeletePipeline({
      pipelineId: physicaleResId,
    });

    return {
      PhysicalResourceId: deletePipelineResp.pipelineDelete!.deletedPipelineID,
    };
  }
}
