import { configure as stringifyConfigure } from 'safe-stable-stringify';
import { ContextAttributes } from './types';

const safeStringify = stringifyConfigure({
  deterministic: false,
  maximumDepth: 8,
});

/**
 * Safely traverse log metadata and search for nested occurrences of any LogContext
 * attributes. Excludes any Error objects and safely stringifies and parse all
 * other objects to reduce depth and avoid circular reference issues.
 *
 * This does not overwrite any attributes provided in the parentLogContext;
 *
 * @param parentContext
 * @param metadata
 * @param attributes
 * @returns LogContext
 */
export const getLogContext = <Attributes extends ContextAttributes>({
  metadata,
  parentContext,
  attributes,
}: {
  parentContext: Partial<Record<keyof Attributes, string>>;
  metadata: unknown[];
  attributes: Attributes;
}): Partial<Record<keyof Attributes, string>> => {
  const metadataWithoutError = metadata.filter((p) => !(p instanceof Error));

  const safeMetadata = JSON.parse(safeStringify(metadataWithoutError));
  const logContext = findLogContext(parentContext, attributes, safeMetadata);

  return logContext;
};

/**
 * Recursively traverse an 0..n nested objects for occurrences of any LogContext
 * attributes. Does not overwrite any previously provided or found log context attributes.
 *
 * @param parentContext
 * @param logMetadata
 * @returns LogContext
 */
export const findLogContext = <Attributes extends ContextAttributes>(
  parentContext: Partial<Record<keyof Attributes, string>>,
  contextAttributes: Attributes,
  ...logMetadata: unknown[]
): Partial<Record<keyof Attributes, string>> => {
  const depth = {
    maximumDepth: 8,
    currentDepth: 0,
  };

  return findLogContext_inner(depth, parentContext, contextAttributes, ...logMetadata);
};

/**
 * Inner method of findLogContext(). It recursively traverse an 0..n nested objects for
 * occurrences of any LogContext attributes up the maximum depth specified.
 * Does not overwrite any previously provided or found log context attributes.
 *
 * @param parentContext
 * @param logMetadata
 * @returns LogContext
 */
export const findLogContext_inner = <Attributes extends ContextAttributes>(
  opts: {
    maximumDepth: number;
    currentDepth: number;
  },
  parentContext: Partial<Record<keyof Attributes, string>>,
  contextAttributes: Attributes,
  ...logMetadata: unknown[]
): Partial<Record<keyof Attributes, string>> => {
  if (!logMetadata.length) return {};

  let context: Partial<Record<keyof Attributes, string>> = {};
  const parentKeys = Object.keys(parentContext);

  if (opts.currentDepth >= opts.maximumDepth) return { ...context, ...parentContext };

  logMetadata.map((optionalParam) => {
    if (!optionalParam || typeof optionalParam !== 'object') return;
    const paramObj = optionalParam as Record<string, unknown>;
    const paramKeys = Object.keys(paramObj);
    const contextKeys = Object.keys(context);

    paramKeys.forEach((paramKey) => {
      if (parentKeys.includes(paramKey)) return;
      if (contextKeys.includes(paramKey)) return;

      const param = paramObj[paramKey];

      if (typeof param === 'object') {
        const depth = { maximumDepth: opts.maximumDepth, currentDepth: opts.currentDepth + 1 };
        const paramContext = findLogContext_inner(depth, context, contextAttributes, param);
        context = { ...paramContext, ...context };
        return;
      }

      if (!isValueStringOrNumber(param)) {
        return;
      }

      const contextAttributesKey = paramKey;
      const methodOrTrue = contextAttributes[contextAttributesKey];

      if (methodOrTrue === true) {
        context = { ...{ [contextAttributesKey]: param }, ...context };
        return;
      }

      if (typeof methodOrTrue === 'function') {
        const method = methodOrTrue;
        const keyValueToPopulate = method(context, paramObj);
        context = { ...keyValueToPopulate, ...context };
        return;
      }
    });
  });

  return { ...context, ...parentContext };
};

const isValueStringOrNumber = (value: unknown): value is string => {
  if (!value) {
    return false;
  }

  return typeof value === 'string' || typeof value === 'number';
};
