import { IMessage, IMessageDefinition, AbstractMessageFactory, IMessageMetadata } from '..';
import { AbstractMessageConsumer } from './MessageConsumer';
import { IMessageConsumerDefinition } from './MessageConsumer';

describe('Consumer', () => {

  interface ITestData {}
  interface ITestMessage extends IMessage<ITestData> {}

  const TestMessageADefinition: IMessageDefinition = {
    messageType: 'command',
    cloudEvent: {
      dataContentType: 'application/json',
      type: 'test.message.a',
      specVersion: '1.0'
    }
  }

  const TestMessageBDefinition: IMessageDefinition = {
    messageType: 'event',
    cloudEvent: {
      dataContentType: 'application/json',
      type: 'test.message.b',
      specVersion: '1.0'
    }
  }

  const data: ITestData = { };

  const TestEventSchema = {
    type: "object",
    properties: {
      type: { type: "string" },
      data: { type: "object" },
      aMissingProperty: { type: "string" },
     },
    required: ["data", "type", "aMissingProperty"],
  };

  class TestMessageA extends AbstractMessageFactory<ITestData, IMessageMetadata, ITestMessage> {
    definition = TestMessageADefinition;
    schema = TestEventSchema;
  }

  class TestMessageB extends AbstractMessageFactory<ITestData, IMessageMetadata, ITestMessage> {
    definition = TestMessageBDefinition;
    schema = TestEventSchema;
  }

  const TestConsumerDefinition: IMessageConsumerDefinition = {
    queueId: 'queueId',
    bindings: [{ dir: 'in', msg: TestMessageADefinition }],
  };

  class TestConsumer extends AbstractMessageConsumer {
    readonly definition = TestConsumerDefinition;
  }

  const message_a = new TestMessageA().build('', '', data);
  const message_b = new TestMessageB().build('', '', data);

  it('checks if a message is allowed', () => {
    const sut = new TestConsumer();
    expect(sut.isAllowed(message_a)).toBeTruthy();
  });

  it('checks if a message is not allowed', () => {
    const sut = new TestConsumer();
    expect(sut.isAllowed(message_b)).toBeFalsy();
  });

  it('sends an allowed message', async () => {
    const sut = new TestConsumer();
    await expect(sut.send(message_a)).rejects.toThrowError('NOT IMPLEMENTED');
  });

  it('prevents sending messages not specified as allowed', async () => {
    const sut = new TestConsumer();
    await expect(sut.send(message_a)).rejects.toThrow();
  });
});
