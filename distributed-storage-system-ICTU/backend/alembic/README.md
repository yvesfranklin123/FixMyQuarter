# Gestion des Migrations de Base de Données

Ce dossier contient l'environnement Alembic pour gérer les évolutions du schéma SQL.

## Structure
- `env.py` : Cerveau de la migration. Connecte l'app, détecte les modèles et filtre les tables systèmes.
- `script.py.mako` : Template utilisé pour générer les nouveaux fichiers de migration.
- `versions/` : Contient l'historique des modifications (fichiers Python).

## Commandes Usuelles

### 1. Générer une nouvelle migration
À faire après avoir modifié un modèle dans `app/database/models/`.
```bash
# Soyez explicite dans le message (-m)
alembic revision --autogenerate -m "ajout_table_audit_logs"