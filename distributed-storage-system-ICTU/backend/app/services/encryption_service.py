from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64

class EncryptionService:
    def __init__(self, master_key: str):
        # La master key déchiffre les clés des fichiers (KEK)
        # En prod, utilisez un HSM ou AWS KMS
        self.master_key = base64.urlsafe_b64decode(master_key)

    def generate_file_key(self) -> bytes:
        return AESGCM.generate_key(bit_length=256)

    def encrypt_data(self, data: bytes, key: bytes) -> tuple[bytes, bytes]:
        """Retourne (nonce, ciphertext)"""
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, data, None)
        return nonce, ciphertext

    def decrypt_data(self, ciphertext: bytes, key: bytes, nonce: bytes) -> bytes:
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, ciphertext, None)