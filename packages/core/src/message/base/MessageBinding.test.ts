import { isMatching, P } from 'ts-pattern';
import { IUnknownMessage } from './Message';
import { IMessageDefinition } from '..';

import { IMessageExchangeDefinition } from './MessageExchange.definition';
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

  const TestQueue: IMessageExchangeDefinition = { bindings: [], queue: { name: 'test' } };
  const TestOtherQueue: IMessageExchangeDefinition = { bindings: [], queue: { name: 'test-other' }};

  describe('Base/Default IMessageBinding', () => {
    it('supports binding using message definition', () => {
      const sut: IBaseMessageBinding = { dir: 'in', msg: TestEventDefinition };
      expect(sut.msg).toEqual(TestEventDefinition);
    });
  });

  describe('IDirectMessageBinding', () => {
    // it('supports binding using string based message names', () => {
    //   const str = 'messageType';
    //   const sut: IBaseMessageBinding = { dir: 'in', msg: str };
    //   expect(sut.msg).toEqual(str);
    // });

    it('supports binding to handler using string based exchange name', () => {
      const str = 'exchangeType';
      const sut: IDirectMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueue: str,
      };

      expect(sut.toQueue).toEqual(str);
    });

    it('supports binding to handler using exchange definition', () => {
      const sut: IDirectMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueue: TestQueue,
      };

      expect(sut.toQueue).toEqual(TestQueue);
    });

  });

  describe('IFanOutMessageBinding', () => {
    it('supports binding to subscriber(s) using string based subscriber name', () => {
      const str = 'exchangeType';
      const sut: IFanOutMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueues: [str],
      };

      expect(sut.toQueues[0]).toEqual(str);
    });

    it('supports binding to subscriber(s) using exchange definition', () => {
      const sut: IFanOutMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toQueues: [TestQueue, TestOtherQueue],
      };

      expect(sut.toQueues[0]).toEqual(TestQueue);
      expect(sut.toQueues[1]).toEqual(TestOtherQueue);
    });
  });

  describe('ITopicMessageBinding', () => {
    it('supports binding to subscriber(s) using string based subscriber name', () => {
      const str = 'exchangeType';
      const sut: ITopicMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toSubscribers: [str],
        pattern: (e) => isMatching(P.any, e),
      };

      expect(sut.toSubscribers[0]).toEqual(str);
    });

    it('supports binding to subscriber(s) using exchange definition', () => {
      const sut: ITopicMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toSubscribers: [TestQueue, TestOtherQueue],
        pattern: (e: IUnknownMessage) => isMatching({ type: TestEventDefinition.cloudEvent.type }, e),
      };

      expect(sut.toSubscribers[0]).toEqual(TestQueue);
      expect(sut.toSubscribers[1]).toEqual(TestOtherQueue);
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

      const sut: ITopicMessageBinding = {
        dir: 'out',
        msg: TestEventDefinition,
        toSubscribers: [TestQueue, TestOtherQueue],
        pattern: (e: IUnknownMessage) => isMatching({ type: TestEventDefinition.cloudEvent.type }, e),
      };

      expect(sut.pattern(message)).toBeTruthy();
    });
  });
});
