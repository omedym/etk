import { Queue } from 'bullmq';

import { ILogger } from '../../telemetry';
import { IMessage, IMessageDefinition, AbstractMessageFactory, IMessageMetadata } from '..';
import { AbstractMessageExchange } from './MessageExchange';
import { IMessageExchangeDefinition } from './MessageExchange';

describe('Exchange', () => {
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

  class TestMessageA extends AbstractMessageFactory<ITestData, IMessageMetadata, ITestMessage> {
    definition = TestMessageADefinition;
    schema = TestEventSchema;
  }

  class TestMessageB extends AbstractMessageFactory<ITestData, IMessageMetadata, ITestMessage> {
    definition = TestMessageBDefinition;
    schema = TestEventSchema;
  }

  const TestExchangeDefinition: IMessageExchangeDefinition = {
    queueId: 'queueId',
    bindings: [{ dir: 'in', msg: TestMessageADefinition }],
  };

  class TestExchange extends AbstractMessageExchange {
    readonly definition = TestExchangeDefinition;
    async send(message: IMessage) { await this.publishOrSend(message) }
  }

  const message_a = new TestMessageA().build('', '', data);
  const message_b = new TestMessageB().build('', '', data);

  const queue: Queue = jest.mocked<Queue>({
    add: jest.fn(),
  } as unknown as Queue)

  it('can check if a message is allowed', () => {
    const sut = new TestExchange(queue, logger);
    expect(sut.isAllowed(message_a)).toBeTruthy();
  });

  it('can check if a message is not allowed', () => {
    const sut = new TestExchange(queue, logger);
    expect(sut.isAllowed(message_b)).toBeFalsy();
  });

  it('publishes or sends an allowed message', async () => {
    const sut = new TestExchange(queue, logger);
    await sut.send(message_a);
    expect (queue.add).toBeCalled();
  });

  it('prevents publishing or sending messages not specified as allowed', async () => {
    const sut = new TestExchange(queue, logger);
    await expect(sut.send(message_b)).rejects.toThrow();
  });
});
