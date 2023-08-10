import { randomBytes } from 'crypto';
import { decryptMessage, encryptMessage, generateSecretKey } from './crypto';

describe('crypto', () => {
  it('should generate secret key', () => {
    const key = generateSecretKey();

    expect(key).toBeTruthy();
    expect(key.split('.').length).toEqual(2);
  });

  it('should encrypt message', () => {
    const testMessage = 'should encrypt a message';
    const { message, key } = encryptMessage({ message: testMessage });

    expect(message).toBeTruthy();
    expect(key).toBeTruthy();
  });

  it('should decrypt message', () => {
    const testMessage = 'should encrypt a message, 2';
    const { message, key } = encryptMessage({ message: testMessage });

    const { message: decrypted } = decryptMessage({ message, key });

    expect(decrypted).toEqual(testMessage);
  });

  it('should encrypt and decrypt message by the given algorithm', () => {
    const testMessage = 'should encrypt a message, 3';
    const algorithm = 'aes256';
    const secretKey = randomBytes(32).toString('hex');
    const initVector = randomBytes(16).toString('hex');

    const { message, key } = encryptMessage({
      message: testMessage,
      key: `${secretKey}.${initVector}`,
      algorithm,
    });
    const { message: decrypted } = decryptMessage({ message, key, algorithm });

    expect(decrypted).toEqual(testMessage);
  });
});
