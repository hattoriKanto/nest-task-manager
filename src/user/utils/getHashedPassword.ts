import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

const getHashedPassword = async (
  password: string,
  salt?: string,
): Promise<{ hash: string; salt: string }> => {
  const currentSalt = salt ? salt : randomBytes(8).toString('hex');
  const hash = (await scrypt(password, currentSalt, 32)) as Buffer;
  return { hash: hash.toString('hex'), salt: currentSalt };
};

export default getHashedPassword;
