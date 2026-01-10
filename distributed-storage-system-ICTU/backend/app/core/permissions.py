from enum import Enum
from typing import List
from fastapi import HTTPException, status

class Role(str, Enum):
    OWNER = "owner"          # Accès total système
    ADMIN = "admin"          # Gestion utilisateurs/nodes
    USER = "user"            # Accès standard (Drive)
    AUDITOR = "auditor"      # Lecture seule logs
    SYSTEM = "system"        # Communication interne

class Permission(str, Enum):
    # Fichiers
    FILE_READ = "file:read"
    FILE_WRITE = "file:write"
    FILE_DELETE = "file:delete"
    
    # Admin
    USER_MANAGE = "user:manage"
    NODE_MANAGE = "node:manage"
    VIEW_AUDIT = "audit:view"

# Matrice des rôles (Qui peut faire quoi)
ROLE_PERMISSIONS = {
    Role.OWNER: [p for p in Permission], # Tout
    Role.ADMIN: [
        Permission.USER_MANAGE, Permission.NODE_MANAGE, 
        Permission.VIEW_AUDIT, Permission.FILE_READ
    ],
    Role.USER: [
        Permission.FILE_READ, Permission.FILE_WRITE, Permission.FILE_DELETE
    ],
    Role.AUDITOR: [
        Permission.VIEW_AUDIT
    ]
}

class AccessControl:
    """Vérificateur de permissions à injecter dans les routes"""
    def __init__(self, required_permissions: List[Permission]):
        self.required_permissions = required_permissions

    def __call__(self, user_role: Role):
        user_perms = ROLE_PERMISSIONS.get(user_role, [])
        
        # Vérifie si l'utilisateur possède TOUTES les permissions requises
        for perm in self.required_permissions:
            if perm not in user_perms:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission manquante: {perm}"
                )