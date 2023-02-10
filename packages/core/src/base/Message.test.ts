import type { IMessage } from './Message';
import type { IAllowAdditionalProperties } from './MessageData';

// This 'test' file validates various type composition through examples.

interface BaseData
{
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

/** A message instance where its data is restricted to explicitly defined properties */
const restrictedMessage: RestrictedMessage = {
  ...baseMessage,
  context: { tenantId: 'tenantId'},
  data: { someStr: 'abc', someNum: 123 },
};

/**
 * A message instance where data has defined properties but also allows for
 * unspecific additional properties.
 */
const openMessage: OpenMessage = {
  ...baseMessage,
  context: { tenantId: 'tenantId'},
  data: { someStr: 'abc', someNum: 123, anyNum: 123 },
};

/**
 * A message instance where no defined data properties of any kind are specified.
 */
const unknownMessage: UnknownMessage = {
  ...baseMessage,
  context: { tenantId: 'tenantId'},
  data: { anyStr: 'abc', anyNum: 123 },
};
