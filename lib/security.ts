// lib/security.ts - Gestione sicurezza e crittografia opzionale
import { Palace } from '@/types';

const ENCRYPTION_KEY_STORAGE = 'memorium_encryption_enabled';
const SALT_STORAGE = 'memorium_salt';

// Genera una chiave di crittografia da password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Cripta i dati
export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Genera o recupera salt
  let salt: Uint8Array;
  const storedSalt = localStorage.getItem(SALT_STORAGE);
  
  if (storedSalt) {
    salt = new Uint8Array(JSON.parse(storedSalt));
  } else {
    salt = crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(SALT_STORAGE, JSON.stringify(Array.from(salt)));
  }

  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data)
  );

  // Combina iv + dati criptati
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Decripta i dati
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  const storedSalt = localStorage.getItem(SALT_STORAGE);
  if (!storedSalt) {
    throw new Error('Salt non trovato. Impossibile decriptare.');
  }

  const salt = new Uint8Array(JSON.parse(storedSalt));
  const key = await deriveKey(password, salt);

  // Decodifica base64
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(c => c.charCodeAt(0))
  );

  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

// Verifica se la crittografia è abilitata
export function isEncryptionEnabled(): boolean {
  return localStorage.getItem(ENCRYPTION_KEY_STORAGE) === 'true';
}

// Abilita crittografia
export function enableEncryption(): void {
  localStorage.setItem(ENCRYPTION_KEY_STORAGE, 'true');
}

// Disabilita crittografia
export function disableEncryption(): void {
  localStorage.removeItem(ENCRYPTION_KEY_STORAGE);
  localStorage.removeItem(SALT_STORAGE);
}

// Salva palazzi con crittografia opzionale
export async function saveSecurePalaces(palaces: Palace[], password?: string): Promise<void> {
  const data = JSON.stringify({
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    palaces,
  });

  if (password && isEncryptionEnabled()) {
    const encrypted = await encryptData(data, password);
    localStorage.setItem('memorium_palaces', encrypted);
    localStorage.setItem('memorium_encrypted', 'true');
  } else {
    localStorage.setItem('memorium_palaces', data);
    localStorage.removeItem('memorium_encrypted');
  }
}

// Carica palazzi con decrittografia opzionale
export async function loadSecurePalaces(password?: string): Promise<Palace[]> {
  const stored = localStorage.getItem('memorium_palaces');
  const isEncrypted = localStorage.getItem('memorium_encrypted') === 'true';

  if (!stored) {
    return [];
  }

  try {
    if (isEncrypted && password) {
      const decrypted = await decryptData(stored, password);
      const data = JSON.parse(decrypted);
      return data.palaces || [];
    } else {
      const data = JSON.parse(stored);
      return data.palaces || [];
    }
  } catch (error) {
    console.error('Errore caricamento dati:', error);
    throw new Error('Password errata o dati corrotti');
  }
}

// Verifica password
export async function verifyPassword(password: string): Promise<boolean> {
  const stored = localStorage.getItem('memorium_palaces');
  const isEncrypted = localStorage.getItem('memorium_encrypted') === 'true';

  if (!stored || !isEncrypted) {
    return true; // Nessuna password richiesta
  }

  try {
    await decryptData(stored, password);
    return true;
  } catch {
    return false;
  }
}

// Warning PC pubblico
export function checkPublicComputer(): boolean {
  const isPublic = localStorage.getItem('memorium_public_warning_shown');
  if (!isPublic) {
    const result = confirm(
      '⚠️ ATTENZIONE\n\n' +
      'Stai usando un computer pubblico o condiviso?\n\n' +
      'I tuoi dati sono salvati nel browser. Su PC condivisi:\n' +
      '• Usa la crittografia con password\n' +
      '• Esporta backup regolari\n' +
      '• Cancella i dati dopo l\'uso\n\n' +
      'Vuoi abilitare la crittografia ora?'
    );

    localStorage.setItem('memorium_public_warning_shown', 'true');
    
    if (result) {
      enableEncryption();
      return true;
    }
  }
  return false;
}

// Export criptato
export async function exportEncryptedBackup(palaces: Palace[], password: string): Promise<void> {
  const data = JSON.stringify({
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    encrypted: true,
    palaces,
  });

  const encrypted = await encryptData(data, password);
  
  const blob = new Blob([encrypted], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `memorium-encrypted-backup-${Date.now()}.enc`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Import criptato
export async function importEncryptedBackup(file: File, password: string): Promise<Palace[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const encrypted = e.target?.result as string;
        const decrypted = await decryptData(encrypted, password);
        const data = JSON.parse(decrypted);
        
        if (!data.palaces || !Array.isArray(data.palaces)) {
          throw new Error('Formato backup non valido');
        }
        
        resolve(data.palaces);
      } catch (error) {
        reject(new Error('Password errata o file corrotto'));
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsText(file);
  });
}