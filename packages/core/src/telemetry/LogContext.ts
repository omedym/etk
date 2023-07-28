import { configure as stringifyConfigure } from 'safe-stable-stringify'

const safeStringify = stringifyConfigure({
  deterministic: false,
  maximumDepth: 8,
})

export interface LogContext {
  datastore?: string;
  jobId?: string;
  messageId?: string;
  messageType?: string;
  queueId?: string;
  tenantId?: string;
  traceId?: string;
}

/**
 * Safely traverse log metadata and search for nested occurrences of any LogContext
 * attributes. Excludes any Error objects and safely stringifies and reparses all
 * other objects to reduce depth and avoid circular reference issues.
 *
 * This does not overwrite any attributes provided in the parentLogContext;
 *
 * @param parentContext
 * @param logMetadata
 * @returns LogContext
 */
export const getLogContext = (
  parentContext: LogContext,
  ...logMetadata: any[]
): LogContext => {
  const metadataWithoutError = logMetadata.filter(p => !(p instanceof Error));

  const safeMetadata = JSON.parse(safeStringify(metadataWithoutError));
  const logContext = findLogContext(parentContext, safeMetadata);

  return logContext;
}

/**
 * Recursively traverse an 0..n nested objects for occurrences of any LogContext
 * attributes. Does not overwrite any previously provided or found log context attributes.
 *
 * @param parentContext
 * @param logMetadata
 * @returns LogContext
 */
const findLogContext = (
  parentContext: LogContext,
  ...logMetadata: any[]
): LogContext => {
  if(!logMetadata) return {};
  if(logMetadata.length < 0) return {};

  let context: LogContext = {};
  const parentKeys = Object.keys(parentContext);

  logMetadata.map((optionalParam) => {
    if (typeof optionalParam !== 'object' || optionalParam === null) return;
    const paramObj = optionalParam as any;
    const paramKeys = Object.keys(paramObj);
    const contextKeys = Object.keys(context);

    paramKeys.forEach(paramKey => {
      if (parentKeys.includes(paramKey)) return;
      if (contextKeys.includes(paramKey)) return;

      const param  = paramObj[paramKey];

      if (typeof param === 'object') {
        const paramContext = findLogContext(context, param);
        context = { ...paramContext, ...context };
        return;
      }

      switch(paramKey) {
        case 'datastore':
        case 'jobId':
        case 'messageId':
        case 'messageType':
        case 'queueId':
        case 'tenantId':
        case 'traceId':
          context = { ...{[paramKey]: param }, ...context };
          return;

        case 'id':
          // Check to see if this object is a CloudEvent or other message type
          if (paramKeys.includes('data') && paramKeys.includes('specversion'))
            context = { ...{ messageId: param }, ...context };
          return;

        case 'tenantid':
          // Check to see if this object is a CloudEvent or other message type
          if (paramKeys.includes('data') && paramKeys.includes('specversion'))
            context = { ...( !context.tenantId ? { tenantId: param } : {}), ...context };
            return;

        case 'type':
          // Check to see if this object is a CloudEvent or other message type
          if (paramKeys.includes('data') && paramKeys.includes('specversion'))
            context = { ...{ messageType: param }, ...context };
          return;

        default:
          return;
      }
    });
  })

  return { ...context, ...parentContext };
};
