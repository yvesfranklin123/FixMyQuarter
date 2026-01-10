class CustomException(Exception):
    """
    Exception de base pour les erreurs métier contrôlées.
    """
    def __init__(self, message: str, code: str = "GENERIC_ERROR", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)

class InsufficientStorage(CustomException):
    def __init__(self):
        super().__init__(
            message="Espace de stockage insuffisant.",
            code="STORAGE_QUOTA_EXCEEDED",
            status_code=413
        )

class FileNotFound(CustomException):
    def __init__(self):
        super().__init__(
            message="Le fichier demandé est introuvable.",
            code="FILE_NOT_FOUND",
            status_code=404
        )