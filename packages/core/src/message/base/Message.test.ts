import { IMessage } from './Message';
import { IAllowAdditionalProperties } from './MessageData';

describe('Message Composition', () => {

  interface BaseData  {
    someStr: string;
    someNum: number;
  }

  interface RestrictedData extends BaseData {}
  interface OpenData extends IAllowAdditionalProperties, BaseData {}

  interface RestrictedMessage extends IMessage<RestrictedData> {}
  interface OpenMessage extends IMessage<OpenData> {}
  interface UnknownMessage extends IMessage{}

  const baseMessage = {
    id: '',
    metadata: {},
    source: '',
    specversion: '',
    tenantid: '',
    type: ''
  }

  it('supports a message instance where its data is restricted to explicitly defined properties', () => {
    /** A message instance where its data is restricted to explicitly defined properties */
    const restrictedMessage: RestrictedMessage = {
      ...baseMessage,
      context: { tenantId: 'tenantId'},
      data: { someStr: 'abc', someNum: 123 },
    };

    expect(restrictedMessage).toBeDefined();
  });

  it('supports a message instance where data has defined properties but also allows for unspecific additional properties', () => {
    const openMessage: OpenMessage = {
      ...baseMessage,
      context: { tenantId: 'tenantId'},
      data: { someStr: 'abc', someNum: 123, anyNum: 123 },
    };

    expect(openMessage).toBeDefined();
  });

  it('supports a message instance where no defined data properties of any kind are specified', () => {
    const unknownMessage: UnknownMessage = {
      ...baseMessage,
      context: { tenantId: 'tenantId'},
      data: { anyStr: 'abc', anyNum: 123 },
    };

    expect(unknownMessage).toBeDefined();
  });

});
