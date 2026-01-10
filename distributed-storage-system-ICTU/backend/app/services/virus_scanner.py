import clamd
from io import BytesIO
import logging

logger = logging.getLogger("VirusScanner")

class VirusScanner:
    def __init__(self, host='clamav', port=3310):
        try:
            self.cd = clamd.ClamdNetworkSocket(host, port)
        except Exception:
            self.cd = None
            logger.warning("ClamAV not connected")

    def scan_stream(self, file_stream: BytesIO) -> bool:
        """Retourne True si Clean, False si Virus"""
        if not self.cd:
            return True # Fail open ou closed selon la politique de sécurité
            
        try:
            result = self.cd.instream(file_stream)
            # result = {'stream': ('OK', None)} ou {'stream': ('FOUND', 'Eicar-Test-Signature')}
            status = result.get('stream', [])
            if status[0] == 'FOUND':
                logger.critical(f"VIRUS DETECTED: {status[1]}")
                return False
            return True
        except Exception as e:
            logger.error(f"Scan error: {e}")
            return False # En cas d'erreur, on rejette par prudence