import * as api from './codegen/buildkite-api/api';
import {
  PipelineHandler,
  PipelineResourceDeleteEvent,
  PipelineResourceEvent,
  PipelineResourceUpdateEvent,
} from './resources/pipeline';
import {CloudFormationCustomResourceEvent, CloudFormationCustomResourceResponse} from 'aws-lambda';
import {assertEnvVarIsDefined} from './utils';
import {getAuthenticatedClient, getSecretsManagerSecret, getSecretsManagerSecretValue} from './setup';

/**
 * on_event is the entrypoint of the lambda function
 *
 * it requires the following env vars:
 * - `BUILDKITE_API_TOKEN_SECRET_ARN`: a partial or full ARN of the secretsmanager secret containing the api token
 *
 * it does the following:
 * - retrieve the buildkite api token from aws secretsmanager
 * - setup an authenticated graphql client to communicate with the buildkite api
 * - route the event to the appropriate resource handlers based on the ResourceType and RequestType event parameters
 */
export async function on_event(
  event: CloudFormationCustomResourceEvent
): Promise<Partial<CloudFormationCustomResourceResponse>> {
  let client: api.Sdk;
  try {
    const tokenArn = assertEnvVarIsDefined('BUILDKITE_API_TOKEN_SECRET_ARN');

    // Retrieve the Buildkite API token
    const apiToken = getSecretsManagerSecretValue(await getSecretsManagerSecret(tokenArn));

    // Setup a Buildkite GrapQL Client
    client = await getAuthenticatedClient(apiToken);
    if (!client) {
      throw Error('failed to initialize graphql client');
    }
  } catch (err) {
    throw new Error(`While setting up client: ${err}`);
  }

  const resourceType = event.ResourceType;
  const requestType = event.RequestType;

  try {
    if (resourceType === PipelineHandler.RESOURCE_TYPE) {
      const pipelineHandler = new PipelineHandler(client, event as PipelineResourceEvent);
      switch (requestType) {
        case 'Create':
          return await pipelineHandler.on_create();
        case 'Update':
          return await pipelineHandler.on_update((event as PipelineResourceUpdateEvent).PhysicalResourceId);
        case 'Delete':
          return await pipelineHandler.on_delete((event as PipelineResourceDeleteEvent).PhysicalResourceId);
      }
    }
  } catch (err) {
    throw new Error(`While executing handler: ${err}`);
  }
  throw new Error(`Resource of type '${resourceType}' is not supported`);
}
