import { randomBytes, createCipheriv, createDecipheriv, CipherGCMTypes } from 'node:crypto';

const defaultAlgorithm = 'aes-256-gcm';
const defaultAlgorithmKeyLength = 32;
const authTagLength = 16;
const cipherAuthModes = ['gcm', 'ccm', 'ocb'];

const isAuthMode = (algorithm: string) => {
  const [name, length, mode] = algorithm.split('-');
  return cipherAuthModes.includes(mode);
};

export const getDefaultAlgorithm = () => {
  return defaultAlgorithm;
};

export const generateSecretKey = (length: number = defaultAlgorithmKeyLength) => {
  const secretKey = randomBytes(length).toString('hex');
  const initVector = randomBytes(16).toString('hex');

  return `${secretKey}.${initVector}`;
};

export const encryptMessage = ({
  message,
  key,
  algorithm = defaultAlgorithm,
}: {
  message: string;
  key?: string;
  algorithm?: string;
}): { message: string; key: string } => {
  let secretKey: Buffer, initVector: Buffer;

  if (key) {
    const [argSecretKey, argIv] = key.split('.');
    secretKey = Buffer.from(argSecretKey, 'hex');
    initVector = Buffer.from(argIv, 'hex');
  } else {
    secretKey = randomBytes(defaultAlgorithmKeyLength);
    initVector = randomBytes(16);
  }

  const cipher = createCipheriv(
    algorithm as CipherGCMTypes,
    Buffer.from(secretKey),
    Buffer.from(initVector),
    { authTagLength: authTagLength },
  );
  const encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
  let tag: string = '';

  if (isAuthMode(algorithm)) {
    tag = cipher.getAuthTag().toString('hex');
  }

  return {
    message: `${encrypted}${tag}`,
    key: `${secretKey.toString('hex')}.${initVector.toString('hex')}`,
  };
};

export const decryptMessage = ({
  message: messageRaw,
  key,
  algorithm = defaultAlgorithm,
}: {
  message: string;
  key: string;
  algorithm?: string;
}): { message: string } => {
  const [secretKey, iv] = key.split('.');
  let message: string;
  let authTag: string = '';

  if (isAuthMode(algorithm)) {
    const authTagStartIndex = messageRaw.length - authTagLength * 2;
    authTag = messageRaw.substring(authTagStartIndex);
    message = messageRaw.substring(0, authTagStartIndex);
  } else {
    message = messageRaw;
  }

  const decipher = createDecipheriv(
    algorithm as CipherGCMTypes,
    Buffer.from(secretKey, 'hex'),
    Buffer.from(iv, 'hex'),
  );

  if (authTag) {
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  }

  const decrypted = decipher.update(message, 'hex', 'utf8') + decipher.final('utf8');

  return {
    message: decrypted,
  };
};
