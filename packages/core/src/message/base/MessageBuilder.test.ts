import { IEvent, IEventDefinition, IEventMetadata } from '../Event';
import { AbstractMessageBuilder } from './MessageBuilder';

describe('MessageBuilder', () => {
  interface ITestData {}
  interface ITestEvent extends IEvent<ITestData> {}

  const TestEventDefinition: IEventDefinition = {
    messageType: 'event',
    cloudEvent: {
      dataContentType: 'application/json',
      type: 'test.message',
      specVersion: '1.0',
    },
  };

  const data: ITestData = {};

  const TestEventSchema = {
    type: 'object',
    properties: {
      type: { type: 'string' },
      data: { type: 'object' },
      aMissingProperty: { type: 'string' },
    },
    required: ['data', 'type', 'aMissingProperty'],
  };

  class TestEvent extends AbstractMessageBuilder<ITestData, IEventMetadata, ITestEvent> {
    definition: IEventDefinition = TestEventDefinition;
    schema = TestEventSchema;
  }

  it('can seal an instance', () => {
    const event = new TestEvent().build('', '', data).seal().get();

    expect(event.idempotencykey).toBeTruthy();
  });

  it('can seal and verify instance', () => {
    const event = new TestEvent().build('', '', data).seal();
    const isVerified = event.verify();

    expect(isVerified).toBeTruthy();
  });

  it('can validate an instance', () => {
    const event = new TestEvent().build('', '', data);
    const check = event.validate();

    expect(check).toBeTruthy();
  });

  it(`can report an invalid instance`, () => {
    const event = new TestEvent().build('', '', data);
    const check = event.validate();

    expect(check.isValid).toBeFalsy();
    expect(check.errors).toHaveLength(1);
  });

  it(`can set correlation (correlationId)`, () => {
    const event1 = new TestEvent().build('', '', data);
    const event2 = new TestEvent().build('', '', data);

    event2.setCorrelation(event1.get());
    expect(event2.get().metadata.correlationId).toEqual(event1.get().id);
    expect(event2.get().metadata.traceId).toEqual(event1.get().id);
  });

  it(`can set correlation (traceId)`, () => {
    const event1 = new TestEvent().build('', '', data);
    const event2 = new TestEvent().build('', '', data);
    const event3 = new TestEvent().build('', '', data);

    event2.setCorrelation(event1.get());
    event3.setCorrelation(event2.get());
    expect(event2.get().metadata.correlationId).toEqual(event1.get().id);
    expect(event2.get().metadata.traceId).toEqual(event1.get().id);

    expect(event3.get().metadata.correlationId).toEqual(event2.get().id);
    expect(event3.get().metadata.traceId).toEqual(event1.get().id);
  });
});
