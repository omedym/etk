import { LogContext } from '../../telemetry';


/**
 * Traverse an 0..n optional parameters and search for nested occurrences of any
 * LogContext attributes. Does not overwrite any previously provided or found
 * log context attributes.
 *
 * @param parentContext
 * @param optionalParams
 * @returns LogContext
 */
export const findMessageLogContext = (
  parentContext: LogContext,
  ...optionalParams: any[]
): LogContext => {
  if(!optionalParams) return {};
  if(optionalParams.length < 0) return {};

  let context: LogContext = {};
  const parentKeys = Object.keys(parentContext);

  optionalParams.map((optionalParam) => {
    if (typeof optionalParam !== 'object' || optionalParam === null) return;
    const paramObj = optionalParam as any;
    const paramKeys = Object.keys(paramObj);
    const contextKeys = Object.keys(context);

    paramKeys.forEach(paramKey => {
      if (parentKeys.includes(paramKey)) return;
      if (contextKeys.includes(paramKey)) return;

      const param  = paramObj[paramKey];

      if (typeof param === 'object') {
        const paramContext = findMessageLogContext(context, param);
        context = { ...paramContext, ...context };
        return;
      }

      switch(paramKey) {
        case 'jobId':
        case 'messageId':
        case 'queueId':
        case 'tenantId':
        case 'traceId':
          context = { ...{[paramKey]: param }, ...context };
          return;

        case 'tenantid':
          // Check to see if this object is a CloudEvent or other message type
          if (paramKeys.includes('data') && paramKeys.includes('specversion'))
            context = { ...{ tenantId: param }, ...context };
          return;

        case 'id':
          // Check to see if this object is a CloudEvent or other message type
          if (paramKeys.includes('data') && paramKeys.includes('specversion'))
            context = { ...{ messageId: param }, ...context };
          return;

        default:
          return;
      }
    });
  })

  return { ...context, ...parentContext };
};
