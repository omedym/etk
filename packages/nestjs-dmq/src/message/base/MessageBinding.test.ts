import { isMatching, P } from 'ts-pattern';
import { IUnknownMessage } from './Message';
import { IMessageDefinition, IMessageQueueDefinition } from '..';

import { IMessageExchangeDefinition } from './MessageExchange';
import type { IEvent, IEventDefinition } from '../Event';
import type { IDirectMessageBinding, IFanOutMessageBinding, IBaseMessageBinding, ITopicMessageBinding } from './MessageBinding';

describe('Message Binding', () => {

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

  const TestQueue: IMessageExchangeDefinition = { bindings: [], queueId: 'test' };
  const TestOtherQueue: IMessageExchangeDefinition = { bindings: [], queueId: 'test-other' };

  describe('Base/Default IMessageBinding', () => {
    it('supports binding using message definition', () => {
      const sut: IBaseMessageBinding = { dir: 'in', msg: TestEventDefinition };
      expect(sut.msg).toEqual(TestEventDefinition);
    });
  });

  describe('IDirectMessageBinding', () => {
    it('supports binding to a queue using a direct binding with an exchange definition', () => {
      const sut: IDirectMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueue: TestQueue,
      };

      expect(sut.toQueue).toEqual(TestQueue);
    });

  });

  describe('IFanOutMessageBinding', () => {
    it('supports binding to queue(s) using a fanout binding with an exchange definition', () => {
      const sut: IFanOutMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueue: [TestQueue, TestOtherQueue],
      };

      expect(sut.toQueue[0]).toEqual(TestQueue);
      expect(sut.toQueue[1]).toEqual(TestOtherQueue);
    });
  });

  describe('ITopicMessageBinding', () => {
    // it('supports binding to subscriber(s) using string based subscriber name', () => {
    //   const str = 'exchangeType';
    //   const sut: ITopicMessageBinding = {
    //     dir: 'out',
    //     msg: TestEventDefinition,
    //     toSubscribers: [str],
    //     pattern: (e) => isMatching(P.any, e),
    //   };

    //   expect(sut.toSubscribers[0]).toEqual(str);
    // });

    it('supports binding to queues(s) using a topic binding with an exchange definition', () => {
      const sut: ITopicMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueue: [TestQueue, TestOtherQueue],
        pattern: (e: IUnknownMessage) => isMatching({ type: TestEventDefinition.cloudEvent.type }, e),
      };

      expect((sut.toQueue as IMessageQueueDefinition[])[0]).toEqual(TestQueue);
      expect((sut.toQueue as IMessageQueueDefinition[])[1]).toEqual(TestOtherQueue);
    });

    it('supports strong typing when defining a pattern match', () => {
      const message = {
        type: 'test.message',
        context: {
          tenantId: 'tenantId',
        },
        data: {},
        metadata: {},
        specversion: '',
        tenantid: '',
        id: '',
        source: ''
      };

      type TestMessage = typeof message;

      const sut: ITopicMessageBinding<TestMessage> = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueue: [TestQueue, TestOtherQueue],
        pattern: (m) => isMatching({ type: TestEventDefinition.cloudEvent.type }, m),
      };

      expect(sut.pattern(message)).toBeTruthy();
    });
  });
});
