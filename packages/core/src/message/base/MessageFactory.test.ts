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

  class TestEvent extends AbstractMessageFactory<ITestData, IEventMetadata, ITestEvent> {
    definition: IEventDefinition = TestEventDefinition;
  }

  const data: ITestData = { };

  it('should seal and verify instance', () => {
    const messageFactory = new TestEvent();

    const event = messageFactory.build('', '', data);

    const sealed = messageFactory.seal(event);
    const isVerified = messageFactory.verify(sealed);

    expect(isVerified).toBeTruthy();
  });
});
