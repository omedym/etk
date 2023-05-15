import { IExchangeDefinition, AbstractExchange } from ".";
import { IMessage } from "./Message";
import { IMessageDefinition } from "./MessageDefinition";
import { AbstractMessageFactory } from "./MessageFactory";
import { IMessageMetadata } from "./MessageMetadata";

describe('Gateway', () => {

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
    type: 'object',
    properties: {
      type: { type: 'string' },
      data: { type: 'object' },
      aMissingProperty: { type: 'string' },
     },
    required: ['data', 'type', 'aMissingProperty'],
  };

  class TestMessageA extends AbstractMessageFactory<ITestData, IMessageMetadata, ITestMessage> {
    definition = TestMessageADefinition;
    schema = TestEventSchema;
  }

  class TestMessageB extends AbstractMessageFactory<ITestData, IMessageMetadata, ITestMessage> {
    definition = TestMessageBDefinition;
    schema = TestEventSchema;
  }

  const TestGatewayDefinition: IExchangeDefinition = {
    bindings: [{ dir: 'in', msg: TestMessageADefinition }],
    queue: {
      name: 'queueName',
    },
  };

  class TestGateway extends AbstractExchange {
    readonly definition = TestGatewayDefinition;
  }

  const message_a = new TestMessageA().build('', '', data);
  const message_b = new TestMessageB().build('', '', data);

  it('can check if a message is allowed', () => {
    const sut = new TestGateway();
    expect(sut.isAllowed(message_a)).toBeTruthy();
  });

  it('can check if a message is not allowed', () => {
    const sut = new TestGateway();
    expect(sut.isAllowed(message_b)).toBeFalsy();
  });

  it('can publish or send an allowed message', () => {
    const sut = new TestGateway();

    expect(() => sut.publishOrSend(message_a))
      .toThrowError('NOT IMPLEMENTED');
  });

  it('can prevent publishing or send a message', () => {
    const sut = new TestGateway();

    expect(() => sut.publishOrSend(message_b))
      .toThrow();
  });
});
