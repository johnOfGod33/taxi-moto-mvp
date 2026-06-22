# Choix techniques – MVP Taxi-Moto

## 1. Framework

**Next.js** (App Router) pour le frontend et le backend (API routes / route handlers). Un seul projet, un seul déploiement.

## 2. Base de données

**PostgreSQL** hébergé sur **Neon** (serverless, compatible Vercel, tier gratuit suffisant pour le MVP).

Raisons :
- Les données du MVP sont relationnelles (Client, Conducteur, Course) avec des relations claires entre elles
- Intégration native avec Vercel (variable d'environnement `DATABASE_URL` injectée automatiquement via l'intégration Vercel-Neon)
- Scaling serverless : pas de serveur à gérer, facture à l'usage
- Migration facile vers un plan payant si le trafic augmente

## 3. ORM

**Prisma** pour modéliser le schéma (Client, Conducteur, Course) et exécuter les migrations vers Neon.

## 4. Schéma de données (proposition)

> Le code et le schéma de base de données sont en anglais (convention de l'équipe), seuls les documents sont en français.

```
Customer
  id, name, phone, createdAt

Driver
  id, name, phone, licensePlate, available, createdAt

Ride
  id, customerId, driverId, destination,
  estimatedPrice, status (pending | accepted | declined | completed),
  paymentMethod (cash | flooz | tmoney), createdAt
```

## 5. Carte et géolocalisation

**Leaflet** + **OpenStreetMap** (gratuit, sans clé API) pour l'affichage de la carte et la géolocalisation du navigateur (`navigator.geolocation`).

## 6. Persistance côté client (sans compte)

Les informations du formulaire (nom, téléphone, plaque) sont stockées dans des **cookies** côté navigateur pour éviter une nouvelle saisie à chaque visite, conformément au rapport de prototypage.

## 7. Déploiement

**Vercel**, déjà en place (build preview automatique sur chaque PR).
