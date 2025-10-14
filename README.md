<p align="center">
  <img src="assets/fixmyquarter-banner.png" alt="FixMyQuarter banner" width="820">
</p>

# FixMyQuarter 🌍

**Une plateforme communautaire open-source pour signaler, suivre et résoudre les problèmes de quartier partout dans le monde.**  
*(nids-de-poule, éclairage défectueux, fuites d’eau, déchets, sécurité, accessibilité, etc.)*

---

## 🧭 Vision (en tant que CEO)

**FixMyQuarter** est un service d’intérêt général qui transforme les signalements citoyens en actions concrètes, grâce à une collaboration structurée entre habitants, associations et autorités locales.  
Notre promesse : **scalabilité** (de la rue au pays), **tolérance aux pannes** (service fiable même en conditions réseaux difficiles) et **collaboration** (co-construction transparente et traçable des solutions).

---

## 🌍 Contexte

Dans de nombreuses villes à travers le monde, des problèmes du quotidien persistent faute de visibilité, de priorisation ou de canaux simples pour les remonter. FixMyQuarter permet aux citoyens de **signaler** en quelques secondes, de **prioriser** collectivement, et aux organisations (mairies, ONG, opérateurs) de **planifier** et **clôturer** efficacement les résolutions.

**Cas d’usage typiques**
- **Voirie** : nids-de-poule, trottoirs endommagés  
- **Infrastructures** : éclairage public, fuites d’eau, coupures d’électricité  
- **Environnement** : dépôts sauvages, poubelles débordantes  
- **Sécurité & accessibilité** : zones dangereuses, obstacles PMR

---

## 🛠️ Fonctionnalités

### Création de signalements
- Titre, description  
- Catégorie (route, électricité, eau, déchets, sécurité, accessibilité, etc.)  
- Géolocalisation  
- Photo(s) en pièce jointe

### Collaboration communautaire
- Commentaires, @mentions, pièces jointes  
- Votes pour la priorisation  
- Historique des statuts (**open → in_progress → resolved**)  
- Rôles : **citoyen**, **modérateur**, **opérateur**, **administrateur**

### Recherche & tri avancés
- Filtres par catégorie, statut, date, distance  
- Recherche texte

### Intégrations
- API REST publique (**Swagger/OpenAPI**)  
- Webhooks & file d’attente pour synchroniser vers des outils tiers (ex. helpdesk municipal)

### Internationalisation
- i18n (interfaces et catégories locales)  
- Fuseaux horaires & unités localisées

---

## 🧱 Architecture (scalable, tolérante aux pannes, collaborative)

- **Backend** : Python + Flask (API stateless, prête à l’horizontal scaling derrière un load balancer)
- **Base de données** : SQLite (dev) / PostgreSQL (prod, avec possibilité de read replicas)
- **Stockage de médias** : S3/MinIO (objets), CDN optionnel

### Asynchrone / Résilience
- Celery + Redis/RabbitMQ pour les tâches (redimensionnement images, webhooks, notifications)  
- Idempotence des jobs, **retries** avec backoff, **circuit breakers**

### Cache
- Redis (listes, recherche, throttling)

### Observabilité
- Logs structurés (JSON), traçage, métriques (Prometheus/Grafana en option)  
- SLO/alertes basiques (latence API, taux d’erreur)

### Sécurité & Gouvernance
- Auth **JWT/OAuth2**, **RBAC** par rôle  
- Validation d’images (taille/type), quotas & **rate limiting**  
- Modération (signalement de contenus, masquage, **audit log**)

### Déploiement
- **Docker** & **docker-compose** (dev/prod)  
- Cibles : Render, Railway, Fly.io, Heroku, AWS ECS/Fargate, Azure App Service, GCP Cloud Run

### Collaboration produit
- Issues & templates GitHub  
- Roadmap publique  
- Contribution guide + **Code of Conduct**

---

## 🔎 Mapping explicite au devoir

### “Scalable”
- API **stateless** + autoscaling horizontal  
- Stockage **objet** + CDN pour servir les médias globalement  
- File d’attente (Celery) pour **lisser les pics** de charge

### “Fault tolerant” (tolérant aux pannes)
- **Retries/backoff** sur jobs, **idempotence**, **DLQ** optionnelle  
- Cache & **dégradations gracieuses** (ex. fallback sans géoloc)  
- **Health checks**, readiness/liveness probes

### “Allow collaboration” (collaboration)
- Commentaires, votes, rôles, **modération**, historique des statuts  
- **Webhooks** pour brancher des partenaires (municipalités/ONG)

---

## ⚙️ Pile technique

| Composant            | Technologie                                  |
|----------------------|-----------------------------------------------|
| Backend API          | Python + Flask                                |
| DB                   | SQLite (dev) / PostgreSQL (prod via Docker)   |
| Files                | S3 / MinIO                                    |
| Asynchrone           | Celery + Redis/RabbitMQ                       |
| Cache                | Redis                                         |
| Conteneurisation     | Docker, docker-compose                        |
| Docs API             | OpenAPI (Swagger UI)                          |
| Tests                | Pytest                                        |
| CI/CD                | GitHub Actions                                |
| Déploiement (exemples)| Heroku, Render, Railway, Fly.io, AWS, Azure  |
