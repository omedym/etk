import { Queue } from 'bullmq';

import { AbstractEventGateway, IEventGatewayDefinition } from './EventGateway';
import { AbstractMessageBuilder } from './base';
import { IEvent, IEventDefinition, IEventMetadata } from './Event';
import { ILogger } from '../telemetry';


describe('EventGateway', () => {
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
  interface ITestEvent extends IEvent<ITestData> {}

  const TestEventADefinition: IEventDefinition = {
    messageType: 'event',
    cloudEvent: {
      dataContentType: 'application/json',
      type: 'test.message.a',
      specVersion: '1.0'
    }
  }

  const TestEventBDefinition: IEventDefinition = {
    messageType: 'event',
    cloudEvent: {
      dataContentType: 'application/json',
      type: 'test.message.b',
      specVersion: '1.0'
    }
  }

  const data: ITestData = { };

  const TestEventSchema = {
    type: 'object',
    properties: {
      type: { type: 'string' },
      data: { type: 'object' },
      aMissingProperty: { type: 'string' },
     },
    required: ['data', 'type', 'aMissingProperty'],
  };

  class TestEventA extends AbstractMessageBuilder<ITestData, IEventMetadata, ITestEvent> {
    definition = TestEventADefinition;
    schema = TestEventSchema;
  }

  class TestEventB extends AbstractMessageBuilder<ITestData, IEventMetadata, ITestEvent> {
    definition = TestEventBDefinition;
    schema = TestEventSchema;
  }

  const TestGatewayDefinition: IEventGatewayDefinition = {
    gatewayType: 'event',
    bindings: [{ dir: 'in', msg: TestEventADefinition }],
    queueId: 'queueId',
  };

  class TestEventGateway extends AbstractEventGateway{
    readonly definition = TestGatewayDefinition;
  }

  const event_a = new TestEventA().build('', '', data).get();
  const event_b = new TestEventB().build('', '', data).get();

  const queue: Queue = jest.mocked<Queue>({
    add: jest.fn(),
  } as unknown as Queue)

  it('can check if a message is allowed', () => {
    const sut = new TestEventGateway(queue, logger);
    expect(sut.isAllowed(event_a)).toBeTruthy();
  });

  it('can check if a message is not allowed', () => {
    const sut = new TestEventGateway(queue, logger);
    expect(sut.isAllowed(event_b)).toBeFalsy();
  });

  it('publishes or sends an allowed message', async () => {
    const sut = new TestEventGateway(queue, logger);
    await sut.publish(event_a);
    expect(queue.add).toBeCalled();
  });

  it('prevents publishing or sending messages not specified as allowed', async () => {
    const sut = new TestEventGateway(queue, logger);
    await expect(sut.publish(event_b)).rejects.toThrow();
  });
});
