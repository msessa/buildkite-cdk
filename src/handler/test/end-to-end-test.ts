import * as m from '../main';
import * as lambda from 'aws-lambda';
import {PipelineHandler} from '../resources/pipeline';

const sample: Partial<lambda.CloudFormationCustomResourceCreateEvent> = {
  ResponseURL: 'http://pre-signed-S3-url-for-response',
  StackId: 'arn:{partition}:cloudformation:{region}:EXAMPLE/stack-name/guid',
  RequestId: 'unique id for this create request',
  ResourceType: 'Custom::TestResource',
  LogicalResourceId: 'MyTestResource',
  ServiceToken: 'arn:aws:lambda:ap-southeast-2:012345678901:function:sample',
};

/**
 * Foo tests
 *
 * @group test/integration
 */

async function main() {
  process.env.AWS_EC2_METADATA_DISABLED = 'true';
  process.env.AWS_SDK_LOAD_CONFIG = '1';
  process.env.BUILDKITE_API_TOKEN_SECRET_ARN =
    'arn:aws:secretsmanager:ap-southeast-2:026506256920:secret:buildkite-api-token';

  const createInput: Partial<lambda.CloudFormationCustomResourceCreateEvent> = {
    RequestType: 'Create',
    ResourceType: PipelineHandler.RESOURCE_TYPE,
    ResourceProperties: {
      ServiceToken: 'test',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/sample.git',
    },
  };
  const createPayload: lambda.CloudFormationCustomResourceCreateEvent = {
    ...sample,
    ...createInput,
  } as lambda.CloudFormationCustomResourceCreateEvent;
  const createResp = await m.on_event(createPayload);
  console.log('create response', createResp);

  const updateInput: Partial<lambda.CloudFormationCustomResourceUpdateEvent> = {
    RequestType: 'Update',
    ResourceType: PipelineHandler.RESOURCE_TYPE,
    PhysicalResourceId: createResp.PhysicalResourceId,
    OldResourceProperties: {
      ServiceToken: 'test',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/sample.git',
    },
    ResourceProperties: {
      ServiceToken: 'test',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/updated.git',
    },
  };

  const updatePayload: lambda.CloudFormationCustomResourceUpdateEvent = {
    ...sample,
    ...updateInput,
  } as lambda.CloudFormationCustomResourceUpdateEvent;
  console.log('update response', await m.on_event(updatePayload));

  const deleteInput: Partial<lambda.CloudFormationCustomResourceDeleteEvent> = {
    RequestType: 'Delete',
    ResourceType: PipelineHandler.RESOURCE_TYPE,
    PhysicalResourceId: createResp.PhysicalResourceId,
    ResourceProperties: {
      ServiceToken: 'test',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/updated.git',
    },
  };

  const deletePayload: lambda.CloudFormationCustomResourceCreateEvent = {
    ...sample,
    ...deleteInput,
  } as lambda.CloudFormationCustomResourceCreateEvent;
  console.log('delete response', await m.on_event(deletePayload));
}

(async () => {
  await main();
})().catch(e => {
  throw e;
});
