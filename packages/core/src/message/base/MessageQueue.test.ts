import { IMessage, IMessageDefinition, AbstractMessageFactory, IMessageMetadata } from '..';
import { AbstractMessageQueue } from './MessageQueue';
import { IMessageQueueDefinition } from './MessageQueue';

describe('MessageQueue', () => {

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

  const TestQueueDefinition: IMessageQueueDefinition = {
    queueId: 'queueId',
    bindings: [{ dir: 'in', msg: TestMessageADefinition }],
  };

  class TestQueue extends AbstractMessageQueue {
    readonly definition = TestQueueDefinition;
  }

  const message_a = new TestMessageA().build('', '', data);
  const message_b = new TestMessageB().build('', '', data);

  it('checks if a message is allowed', () => {
    const sut = new TestQueue();
    expect(sut.isAllowed(message_a)).toBeTruthy();
  });

  it('checks if a message is not allowed', () => {
    const sut = new TestQueue();
    expect(sut.isAllowed(message_b)).toBeFalsy();
  });

  it('adds an allowed message', async () => {
    const sut = new TestQueue();
    expect(() => sut.add(message_a))
      .toThrowError('NOT IMPLEMENTED');
  });

  it('prevents adding messages not specified as allowed', async () => {
    const sut = new TestQueue();
    expect(() => sut.add(message_a))
      .toThrow();
  });
});
