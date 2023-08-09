import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const defaultAlgorithm = 'aes-192-cbc';

export const generateSecretKey = (length: number = 24) => {
  const secretKey = randomBytes(length).toString('hex');
  const initVector = randomBytes(16).toString('hex');

  return `${secretKey}.${initVector}`;
};

export const encryptMessage = ({
  message,
  key,
  algorithm,
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
    secretKey = randomBytes(24); // the length depends on algorithm
    initVector = randomBytes(16);
  }

  const cipher = createCipheriv(
    algorithm || defaultAlgorithm,
    Buffer.from(secretKey),
    Buffer.from(initVector),
  );
  const encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');

  return {
    message: encrypted,
    key: `${secretKey.toString('hex')}.${initVector.toString('hex')}`,
  };
};

export const decryptMessage = ({
  message,
  key,
  algorithm,
}: {
  message: string;
  key: string;
  algorithm?: string;
}): { message: string } => {
  const [secretKey, iv] = key.split('.');

  const decipher = createDecipheriv(
    algorithm || defaultAlgorithm,
    Buffer.from(secretKey, 'hex'),
    Buffer.from(iv, 'hex'),
  );
  const decrypted = decipher.update(message, 'hex', 'utf8') + decipher.final('utf8');

  return {
    message: decrypted,
  };
};
