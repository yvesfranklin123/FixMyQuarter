import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

# Clé interne du Node (injectée via variable d'environnement au démarrage du pod K8s)
# C'est la clé qui protège tout ce qui est écrit sur CE disque spécifique.
NODE_MASTER_KEY = os.getenv("NODE_MASTER_SECRET", "change_me_in_production_please_32chars")

class StorageEncryption:
    """
    Gère le chiffrement/déchiffrement des blocs de données avant l'écriture disque.
    """
    def __init__(self):
        # Dérivation d'une clé binaire propre de 256 bits depuis le secret
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'static_node_salt', # En prod, unique par node
            iterations=100000,
        )
        self.key = kdf.derive(NODE_MASTER_KEY.encode())
        self.aesgcm = AESGCM(self.key)

    def encrypt_block(self, data: bytes) -> bytes:
        """
        Chiffre un bloc de données.
        Ajoute un nonce unique (12 bytes) au début du blob.
        """
        nonce = os.urandom(12)
        # AES-GCM ajoute automatiquement un Tag d'intégrité à la fin
        ciphertext = self.aesgcm.encrypt(nonce, data, None) 
        return nonce + ciphertext

    def decrypt_block(self, encrypted_data: bytes) -> bytes:
        """
        Déchiffre un bloc lu depuis le disque.
        Lève une exception si les données sont corrompues (tampering).
        """
        try:
            # Extraction du nonce (12 premiers octets)
            nonce = encrypted_data[:12]
            ciphertext = encrypted_data[12:]
            return self.aesgcm.decrypt(nonce, ciphertext, None)
        except Exception:
            raise ValueError("Data Integrity Check Failed (Decryption Error)")

# Instance globale pour le Node
local_cipher = StorageEncryption()