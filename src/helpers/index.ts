import crypto from 'crypto';

const SECRET = 'INSIRA-ALGO-SUPER-SECRETO-AQUI'

export const random = () => crypto.randomBytes(128).toString('base64');

export const authentication = (password: string, salt: string) => {
  return crypto.createHmac('sha256', [salt, password].join('/')).update(SECRET).digest('hex')
}

export const encrypt = (text: string, secretKey: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', Buffer.from(secretKey));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export const decrypt = (encryptedText: string, secretKey: string): string => {
  const decipher = crypto.createDecipher('aes-256-cbc', Buffer.from(secretKey));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
