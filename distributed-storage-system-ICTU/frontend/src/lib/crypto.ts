/**
 * Utilitaires de cryptographie Client-Side (End-to-End Encryption)
 * Algorithme : AES-GCM 256-bit
 */

// Génère une clé symétrique aléatoire
export async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Exporte la clé en format Raw (pour stockage local ou partage sécurisé)
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  // Conversion propre Buffer -> Base64
  const exportedBuffer = new Uint8Array(exported);
  let binary = '';
  for (let i = 0; i < exportedBuffer.byteLength; i++) {
    binary += String.fromCharCode(exportedBuffer[i]);
  }
  return window.btoa(binary);
}

// Chiffre un fichier (Blob/File)
export async function encryptFile(file: File, key: CryptoKey): Promise<{ encryptedBlob: Blob, iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector unique
  const arrayBuffer = await file.arrayBuffer();

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedContent], { type: 'application/octet-stream' }),
    iv: iv
  };
}

// Déchiffre un contenu binaire
export async function decryptFile(
  encryptedBuffer: ArrayBuffer, 
  key: CryptoKey, 
  iv: Uint8Array,
  mimeType: string
): Promise<Blob> {
  const decryptedContent = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      // CORRECTION ICI : On force le type pour rassurer TypeScript
      iv: iv as unknown as BufferSource,
    },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedContent], { type: mimeType });
}