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
  const tenantId: string = 'tenantId';

  const TestEventSchema = {
    type: 'object',
    properties: {
      type: { type: 'string' },
      data: { type: 'object' },
      tenantid: {
        minLength: 5,
        maxLength: 10,
        type: 'string',
      },
    },
    required: ['data', 'type', 'tenantid'],
  };

  class TestEvent extends AbstractMessageBuilder<ITestData, IEventMetadata, ITestEvent> {
    definition: IEventDefinition = TestEventDefinition;
    schema = TestEventSchema;
  }

  it('can seal an instance', () => {
    const event = new TestEvent().with(tenantId, '', data).build({ throwOnError: false });
    expect(event.idempotencykey).toBeTruthy();
  });

  it('can seal and verify instance', () => {
    const event = new TestEvent().with(tenantId, '', data).build({ throwOnError: false });
    const isVerified = new TestEvent().verify(event);

    expect(isVerified).toBeTruthy();
  });

  it('can validate an instance', () => {
    const event = new TestEvent().with(tenantId, '', data).build();
    const check = new TestEvent().validate(event);

    expect(check.isValid).toBeTruthy();
  });

  it(`can report an invalid instance`, () => {
    const event = new TestEvent().with(tenantId, '', data).build();
    const { type: missingType, ...badEvent } = event;

    const check = new TestEvent().validate(badEvent as ITestEvent);

    expect(check.isValid).toBeFalsy();

    if (check.isValid)
      return;

    expect(check.errors).toHaveLength(1);
  });

  it(`can set correlation (correlationId)`, () => {
    const builder = new TestEvent().with(tenantId, '', data);

    const event1 = builder.build();
    const event2 = builder.correlateWith(event1).build();

    expect(event2.metadata.correlationId).toEqual(event1.id);
    expect(event2.metadata.traceId).toEqual(event1.id);
  });

  it(`can set correlation (traceId)`, () => {
    const builder = new TestEvent().with(tenantId, '', data);

    const event1 = builder.build();
    const event2 = builder.correlateWith(event1).build();
    const event3 = builder.correlateWith(event2).build();

    expect(event2.metadata.correlationId).toEqual(event1.id);
    expect(event2.metadata.traceId).toEqual(event1.id);

    expect(event3.metadata.correlationId).toEqual(event2.id);
    expect(event3.metadata.traceId).toEqual(event1.id);
  });
});
