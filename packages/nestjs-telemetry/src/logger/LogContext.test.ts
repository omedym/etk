import { ContextAttributes } from './types';
import { findLogContext } from './LogContext';

describe('findLogContext', () => {
  const contextAttributes: ContextAttributes = {
    ipAddress: true,
    tenantId: true,
    testAttribute01: true,
    testAttribute02: true,
  };

  const cloudEventContextAttributes: ContextAttributes = {
    id: (context, metadata) => {
      if (!context || !metadata) {
        return {};
      }

      return { messageId: metadata.id as string };
    },
    tenantid: (context, metadata) => {
      if (!context || !metadata) {
        return {};
      }

      return { tenantId: metadata.tenantid as string };
    },
    type: (context, metadata) => {
      if (!context || !metadata) {
        return {};
      }

      return { messageType: metadata.type as string };
    },
  };

  test('plain metadata', () => {
    const result = findLogContext({}, contextAttributes, {
      testAttribute02: 'testAttribute02',
      testAttribute03: 'testAttribute03',
    });
    const expected = { testAttribute02: 'testAttribute02' };

    expect(result).toStrictEqual(expected);
  });

  test('empty metadata', () => {
    const result = findLogContext({}, contextAttributes);
    const expected = {};

    expect(result).toStrictEqual(expected);
  });

  test('empty metadata key', () => {
    const result = findLogContext({}, contextAttributes, null);
    const expected = {};

    expect(result).toStrictEqual(expected);
  });

  it('should not override parent key', () => {
    const result = findLogContext({ tenantId: 'tenantId1' }, contextAttributes, {
      tenantId: 'tenantId2',
    });
    const expected = { tenantId: 'tenantId1' };

    expect(result).toStrictEqual(expected);
  });

  it('should not override context key', () => {
    const result = findLogContext(
      {},
      contextAttributes,
      {
        tenantId: 'tenantId1',
      },
      {
        tenantId: 'tenantId2',
      },
    );
    const expected = { tenantId: 'tenantId1' };

    expect(result).toStrictEqual(expected);
  });

  test('nested metadata', () => {
    const metadata = {
      testAttribute04: 'testAttribute04',
      body: {
        tenantId: 'tenantId',
      },
    };
    const result = findLogContext({}, contextAttributes, metadata);
    const expected = {
      tenantId: 'tenantId',
    };

    expect(result).toStrictEqual(expected);
  });

  test('nested 4 level deep metadata', () => {
    const metadata = {
      testAttribute04: 'testAttribute04',
      body: {
        tenantId: 'tenantId',
        portal: {
          testAttribute01: 'testAttribute01',
          message: {
            data: {
              messageType: 'messageType',
              value: 'value',
            },
          },
        },
      },
    };
    const result = findLogContext({}, contextAttributes, metadata);
    const expected = {
      tenantId: 'tenantId',
      testAttribute01: 'testAttribute01',
    };

    expect(result).toStrictEqual(expected);
  });

  test('max 8 level deep metadata', () => {
    const metadata = {
      level2: {
        level3: {
          level4: {
            level5: {
              level6: {
                level7: {
                  level8: {
                    testAttribute01: 'testAttribute01',
                    level9: {
                      messageType: 'tooDeep',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = findLogContext({}, contextAttributes, metadata);
    const expected = {
      testAttribute01: 'testAttribute01',
    };

    expect(result).toStrictEqual(expected);
  });

  test('tenantid if message type is not cloudEvent', () => {
    const metadata = {
      body: {
        id: 'messageId',
        tenantid: 'tenantId',
        testAttribute01: 'testAttribute01',
      },
    };
    const result = findLogContext({}, contextAttributes, metadata);

    expect(result).toHaveProperty('testAttribute01');
    expect(result).not.toHaveProperty('tenantid', 'messageId');
  });

  test('tenantid cloudEvent message type', () => {
    const metadata = {
      body: {
        tenantid: 'tenantId',
        data: {},
        specversion: 'specversion',
      },
    };
    const result = findLogContext(
      {},
      { ...contextAttributes, ...cloudEventContextAttributes } as ContextAttributes,
      metadata,
    );
    const expected = {
      tenantId: 'tenantId',
    };

    expect(result).toStrictEqual(expected);
  });

  it('should not override tenantid cloudEvent message type, ', () => {
    const metadata = {
      body: {
        tenantId: 'tenantId-1',
        tenantid: 'tenantId-2',
        data: {},
        specversion: 'specversion',
      },
    };
    const result = findLogContext({}, contextAttributes, metadata);
    const expected = {
      tenantId: 'tenantId-1',
    };

    expect(result).toStrictEqual(expected);
  });

  test('id cloudEvent message type', () => {
    const metadata = {
      body: {
        id: 'messageId',
        data: {},
        specversion: 'specversion',
      },
    };
    const result = findLogContext(
      {},
      { ...contextAttributes, ...cloudEventContextAttributes } as ContextAttributes,
      metadata,
    );
    const expected = {
      messageId: 'messageId',
    };

    expect(result).toStrictEqual(expected);
  });

  test('type cloudEvent message type', () => {
    const metadata = {
      body: {
        type: 'messageType',
        data: {},
        specversion: 'specversion',
      },
    };
    const result = findLogContext(
      {},
      { ...contextAttributes, ...cloudEventContextAttributes } as ContextAttributes,
      metadata,
    );
    const expected = {
      messageType: 'messageType',
    };

    expect(result).toStrictEqual(expected);
  });

  test('all default keys', () => {
    const metadata = {
      testAttribute04: 'testAttribute04',
      body: {
        tenantId: 'tenantId',
        datastore: 'datastore',
        content: {
          contentId: 'contentId',
        },
        portal: {
          testAttribute01: 'testAttribute01',
          testAttribute05: 'testAttribute05',
          message: {
            messageId: 'messageId',
            data: {
              ipAddress: 'ipAddress',
              testAttribute02: 'testAttribute02',
            },
          },
          integration: {
            integrationId: 'integrationId',
          },
        },
      },
    };
    const result = findLogContext({}, contextAttributes, metadata);
    const expected = {
      tenantId: 'tenantId',
      ipAddress: 'ipAddress',
      testAttribute01: 'testAttribute01',
      testAttribute02: 'testAttribute02',
    };

    expect(result).toStrictEqual(expected);
  });

  test('empty log context attributes', () => {
    const contextAttributes: ContextAttributes = {};
    const metadata = {
      testAttribute04: 'testAttribute04',
      body: {
        tenantId: 'tenantId',
      },
    };

    const result = findLogContext({}, contextAttributes, metadata);
    expect(result).toStrictEqual({});
  });

  test('log context attributes', () => {
    const contextAttributes: any = {
      foo: true,
    };
    const metadata = {
      testAttribute04: 'testAttribute04',
      body: {
        tenantId: 'tenantId',
        foo: 'bar',
      },
    };

    const result = findLogContext({}, contextAttributes, metadata);
    expect(result).toStrictEqual({ foo: 'bar' });
  });

  test('log context attributes as method', () => {
    const contextAttributes: any = {
      foo: () => ({ value: 'value' }),
    };
    const metadata = {
      testAttribute04: 'testAttribute04',
      body: {
        tenantId: 'tenantId',
        foo: 'bar',
      },
    };

    const result = findLogContext({}, contextAttributes, metadata);
    expect(result).toStrictEqual({ value: 'value' });
  });

  it('should ignore null, empty, undefined', () => {
    const metadata = {
      testAttribute04: null,
      body: {
        tenantId: undefined,
        testAttribute01: '',
        foo: 'bar',
        testAttribute02: 'testAttribute02',
      },
    };

    const result = findLogContext({}, contextAttributes, metadata);
    expect(result).toStrictEqual({ testAttribute02: 'testAttribute02' });
  });

  it('should not ignore number', () => {
    const metadata = {
      body: {
        tenantId: 'tenantId-1',
        testAttribute02: 11,
      },
    };

    const result = findLogContext({}, contextAttributes, metadata);
    expect(result).toStrictEqual({ testAttribute02: 11, tenantId: 'tenantId-1' });
  });
});
