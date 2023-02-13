import { IEvent, IEventDefinition, IEventMetadata } from '../Event';
import { AbstractMessageFactory } from './MessageFactory';

describe('MessageFactory', () => {

  interface ITestData {}
  interface ITestEvent extends IEvent<ITestData> {}

  const TestEventDefinition: IEventDefinition = {
    messageType: 'event',
    cloudEvent: {
      dataContentType: 'application/json',
      type: 'test.message',
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

  class TestEvent extends AbstractMessageFactory<ITestData, IEventMetadata, ITestEvent> {
    definition: IEventDefinition = TestEventDefinition;
    schema = TestEventSchema;
  }


  it('can seal an instance', () => {
    const sut = new TestEvent();
    const event = sut.build('', '', data);

    const sealed = sut.seal(event);

    expect(sealed.idempotencykey).toBeTruthy();
  });

  it('can seal and verify instance', () => {
    const sut = new TestEvent();
    const event = sut.build('', '', data);

    const sealed = sut.seal(event);
    const isVerified = sut.verify(sealed);

    expect(isVerified).toBeTruthy();
  });

  it('can validate an instance', () => {
    const sut = new TestEvent();
    const event = sut.build('', '', data);

    const check = sut.validate(event);

    expect(check).toBeTruthy();
  });

  it(`can report an invalid instance`, () => {
    const sut = new TestEvent();
    const event = sut.build('', '', data);

    const check = sut.validate(event);

    expect (check.isValid).toBeFalsy();
    expect (check.errors).toHaveLength(1);
  })
});

