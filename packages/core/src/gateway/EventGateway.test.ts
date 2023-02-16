import { IEvent, IEventDefinition, AbstractMessageFactory, IEventMetadata } from '../message';
import { IEventGatewayDefinition, AbstractEventGateway } from './EventGateway';

describe('Gateway', () => {

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

  class TestEventA extends AbstractMessageFactory<ITestData, IEventMetadata, ITestEvent> {
    definition = TestEventADefinition;
    schema = TestEventSchema;
  }

  class TestEventB extends AbstractMessageFactory<ITestData, IEventMetadata, ITestEvent> {
    definition = TestEventBDefinition;
    schema = TestEventSchema;
  }

  const TestGatewayDefinition: IEventGatewayDefinition = {
    gatewayType: 'event',
    allows: [TestEventADefinition],
    queue: {
      name: 'queueName',
    },
  };

  class TestEventGateway extends AbstractEventGateway {
    readonly definition = TestGatewayDefinition;
  }

  const event_a = new TestEventA().build('', '', data);
  const event_b = new TestEventB().build('', '', data);

  it('can check if a message is allowed', () => {
    const sut = new TestEventGateway();
    expect(sut.isAllowed(event_a)).toBeTruthy();
  });

  it('can check if a message is not allowed', () => {
    const sut = new TestEventGateway();
    expect(sut.isAllowed(event_b)).toBeFalsy();
  });

  it('can publish or send an allowed message', () => {
    const sut = new TestEventGateway();

    expect(() => sut.publishOrSend(event_a))
      .toThrowError('NOT IMPLEMENTED');
  });

  it('can prevent publishing or send a message', () => {
    const sut = new TestEventGateway();

    expect(() => sut.publishOrSend(event_b))
      .toThrow();
  });
});

