import * as m from '../main';
import {on_event} from '../main';
import * as lambda from 'aws-lambda';

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

test.skip('end to end test', async () => {
  const createInput: Partial<lambda.CloudFormationCustomResourceCreateEvent> = {
    RequestType: 'Create',
    ResourceProperties: {
      ServiceToken: 'test',
      ApiTokenSecretArn: 'arn:aws:secretsmanager:ap-southeast-2:026506256920:secret:buildkite-api-token',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/sample.git',
    },
  };

  process.env.AWS_EC2_METADATA_DISABLED = 'true';
  process.env.AWS_SDK_LOAD_CONFIG = '1';
  const createPayload: lambda.CloudFormationCustomResourceCreateEvent = {
    ...sample,
    ...createInput,
  } as lambda.CloudFormationCustomResourceCreateEvent;
  // m.on_event(createPayload).then((data: any) => {
  //   expect(data).toBeDefined();
  // });
  const p = m.on_event(createPayload);
  await expect(p).resolves.toBeDefined();
  const resp = await p;
  console.log(resp.PhysicalResourceId);

  const updateInput: Partial<lambda.CloudFormationCustomResourceUpdateEvent> = {
    RequestType: 'Update',
    PhysicalResourceId: resp.PhysicalResourceId,
    OldResourceProperties: {
      ServiceToken: 'test',
      ApiTokenSecretArn: 'arn:aws:secretsmanager:ap-southeast-2:026506256920:secret:buildkite-api-token',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/sample.git',
    },
    ResourceProperties: {
      ServiceToken: 'test',
      ApiTokenSecretArn: 'arn:aws:secretsmanager:ap-southeast-2:026506256920:secret:buildkite-api-token',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/updated.git',
    },
  };

  process.env.AWS_EC2_METADATA_DISABLED = 'true';
  process.env.AWS_SDK_LOAD_CONFIG = '1';
  const updatePayload: lambda.CloudFormationCustomResourceUpdateEvent = {
    ...sample,
    ...updateInput,
  } as lambda.CloudFormationCustomResourceUpdateEvent;
  const p2 = m.on_event(updatePayload);
  await expect(p2).resolves.toBeDefined();
  const resp2 = await p2;
  console.log(resp2.PhysicalResourceId);

  const deleteInput: Partial<lambda.CloudFormationCustomResourceDeleteEvent> = {
    RequestType: 'Delete',
    PhysicalResourceId: resp.PhysicalResourceId,
    ResourceProperties: {
      ServiceToken: 'test',
      ApiTokenSecretArn: 'arn:aws:secretsmanager:ap-southeast-2:026506256920:secret:buildkite-api-token',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/updated.git',
    },
  };

  process.env.AWS_EC2_METADATA_DISABLED = 'true';
  process.env.AWS_SDK_LOAD_CONFIG = '1';
  const deletePayload: lambda.CloudFormationCustomResourceCreateEvent = {
    ...sample,
    ...deleteInput,
  } as lambda.CloudFormationCustomResourceCreateEvent;
  const p3 = m.on_event(deletePayload);
  await expect(p3).resolves.toBeDefined();
  const resp3 = await p3;
  console.log(resp3.PhysicalResourceId);
}, 30000);

test('error is thrown if no apitoken is provided', () => {
  const input: Partial<lambda.CloudFormationCustomResourceCreateEvent> = {
    RequestType: 'Create',
    ResourceProperties: {
      ServiceToken: 'test',
      Organization: 'service-victoria',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/sample.git',
    },
  };

  process.env.AWS_EC2_METADATA_DISABLED = 'true';
  process.env.AWS_SDK_LOAD_CONFIG = '1';
  const payload: lambda.CloudFormationCustomResourceCreateEvent = {
    ...sample,
    ...input,
  } as lambda.CloudFormationCustomResourceCreateEvent;
  return expect(m.on_event(payload)).rejects.toThrow(
    "Expected 'ApiTokenSecretArn' to be defined, but received undefined"
  );
});

test('error is thrown if no organization is provided', () => {
  const input: Partial<lambda.CloudFormationCustomResourceCreateEvent> = {
    RequestType: 'Create',
    ResourceProperties: {
      ServiceToken: 'test',
      ApiTokenSecretArn: 'arn:aws:secretsmanager:ap-southeast-2:026506256920:secret:buildkite-api-token',
      YAMLSteps: '',
      PipelineName: 'XXXTestPipeline',
      RepositoryURL: 'git@github.com:service-victoria/sample.git',
    },
  };

  process.env.AWS_EC2_METADATA_DISABLED = 'true';
  process.env.AWS_SDK_LOAD_CONFIG = '1';
  const payload: lambda.CloudFormationCustomResourceCreateEvent = {
    ...sample,
    ...input,
  } as lambda.CloudFormationCustomResourceCreateEvent;
  return expect(m.on_event(payload)).rejects.toThrow("Expected 'Organization' to be defined, but received undefined");
});
