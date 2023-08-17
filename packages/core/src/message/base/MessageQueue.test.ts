import { Queue } from 'bullmq';

import { ILogger } from '../../telemetry';
import { IMessage, IMessageDefinition, IMessageMetadata, AbstractMessageBuilder } from '..';
import { IMessageQueueDefinition, AbstractMessageQueue} from './MessageQueue';


describe('MessageQueue', () => {
  let logEntries: { msg: string; data: any }[] = [];

  beforeEach(() => {
    logEntries = [];
  });

  const logger = {
    debug: jest.fn((msg, data ) => logEntries.push({ msg: `[debug] ${msg}`, data })),
    error: jest.fn((msg, data ) => logEntries.push({ msg: `[error] ${msg}`, data })),
    info:  jest.fn((msg, data ) => logEntries.push({ msg: ` [info] ${msg}`, data })),
    warn:  jest.fn((msg, data ) => logEntries.push({ msg: ` [warn] ${msg}`, data })),
  } as unknown as ILogger;

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

  class TestMessageA extends AbstractMessageBuilder<ITestData, IMessageMetadata, ITestMessage> {
    definition = TestMessageADefinition;
    schema = TestEventSchema;
  }

  class TestMessageB extends AbstractMessageBuilder<ITestData, IMessageMetadata, ITestMessage> {
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

  const message_a = new TestMessageA().build('', '', data).get();
  const message_b = new TestMessageB().build('', '', data).get();

  const queue: Queue = jest.mocked<Queue>({
    add: jest.fn(),
  } as unknown as Queue)

  it('checks if a message is allowed', () => {
    const sut = new TestQueue(queue, logger);
    expect(sut.isAllowed(message_a)).toBeTruthy();
  });

  it('checks if a message is not allowed', () => {
    const sut = new TestQueue(queue, logger);
    expect(sut.isAllowed(message_b)).toBeFalsy();
  });

  it('adds an allowed message', () => {
    const sut = new TestQueue(queue, logger);
    sut.send(message_a);
    expect(queue.add).toBeCalled();
  });

  it('prevents adding messages not specified as allowed', async () => {
    const sut = new TestQueue(queue, logger);
    await expect(sut.send(message_b)).rejects.toThrow();
  });
});
