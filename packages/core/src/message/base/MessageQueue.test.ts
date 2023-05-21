import { Queue } from 'bullmq';
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
    async send(message: IMessage): Promise<void> { await this.add(message) }
  }

  const message_a = new TestMessageA().build('', '', data);
  const message_b = new TestMessageB().build('', '', data);

  const queue: Queue = jest.mocked<Queue>({
    add: jest.fn(),
  } as unknown as Queue)

  it('checks if a message is allowed', () => {
    const sut = new TestQueue(queue);
    expect(sut.isAllowed(message_a)).toBeTruthy();
  });

  it('checks if a message is not allowed', () => {
    const sut = new TestQueue(queue);
    expect(sut.isAllowed(message_b)).toBeFalsy();
  });

  it('adds an allowed message', () => {
    const sut = new TestQueue(queue);
    sut.send(message_a);
    expect(queue.add).toBeCalled();
  });

  it('prevents adding messages not specified as allowed', async () => {
    const sut = new TestQueue(queue);
    await expect(sut.send(message_b)).rejects.toThrow();
  });
});
