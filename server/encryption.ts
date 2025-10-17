import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Ensure we have a proper encryption key
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required for security');
}

const SECRET_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

export function encryptField(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptField(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Validate auth tag length to prevent tag truncation attacks
    if (authTag.length !== 16) {
      throw new Error('Invalid authentication tag length');
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
}
