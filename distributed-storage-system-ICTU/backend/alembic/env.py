import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# --- 1. SETUP PATH & IMPORTS ---
# Ajout du dossier racine au PYTHONPATH pour que Python trouve le module 'app'
# Cela remonte de deux niveaux : backend/alembic/env.py -> backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

# Import de la configuration et des modèles
from app.core.config import settings
from app.database.base import Base

# IMPORTANT : Importer les modèles ici pour qu'ils soient enregistrés dans Base.metadata
# Si ce fichier n'est pas importé, Alembic ne verra aucune table.
from app.database import models 

# --- 2. CONFIGURATION ALEMBIC ---
config = context.config

# Surcharge de l'URL du fichier alembic.ini avec celle de votre configuration Pydantic.
# Cela permet de ne pas écrire le mot de passe en dur dans alembic.ini
# On utilise str() car Pydantic retourne parfois un objet Url spécial.
config.set_main_option("sqlalchemy.url", str(settings.SQLALCHEMY_DATABASE_URI))

# Configuration du logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Cible pour l'autogenerate (Vos modèles SQLAlchemy)
target_metadata = Base.metadata

# --- 3. FILTRES AVANCÉS ---
def include_object(object, name, type_, reflected, compare_to):
    """
    Fonction de sécurité : Empêche Alembic de supprimer des tables qu'il ne connaît pas.
    Utile si vous avez des tables systèmes (PostGIS) ou d'autres outils dans la même DB.
    """
    # Ignore la table de version d'Alembic et les tables systèmes spatiales
    if type_ == "table" and name in ["spatial_ref_sys", "alembic_version"]:
        return False
    return True

# --- 4. EXÉCUTION ---

def run_migrations_offline() -> None:
    """
    Mode Offline : Génère le script SQL sans se connecter à la DB.
    Utile pour vérifier le SQL généré avant de l'appliquer.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,            # Détecte les changements de types de colonnes
        compare_server_default=True,  # Détecte les changements de valeurs par défaut
        include_object=include_object
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """
    Mode Online : Se connecte à la DB et applique les changements.
    """
    
    # Gestion de la connexion injectée (cas des tests unitaires)
    connectable = context.config.attributes.get("connection", None)

    if connectable is None:
        # Création du moteur standard depuis la configuration
        connectable = engine_from_config(
            config.get_section(config.config_ini_section),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool, # NullPool est recommandé pour les migrations
        )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,            # Important: détecte String(50) -> String(100)
            compare_server_default=True,  # Important: détecte les defaults
            include_object=include_object # Filtre les tables systèmes
        )

        with context.begin_transaction():
            context.run_migrations()

# Sélecteur de mode (Offline vs Online)
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()