# Tâches MVP – Taxi-Moto

> Découle de [`mvp-spec.md`](./mvp-spec.md) et [`tech-stack.md`](./tech-stack.md).
> Les docs sont en français, mais tout le code (routes, modèles, variables, schéma DB) est en anglais.

## 1. Base de données & ORM

- [x] Initialiser Prisma (`prisma init`), configurer `DATABASE_URL` (Neon)
- [x] Modéliser le schéma : `Customer`, `Driver`, `Ride` (voir `tech-stack.md` §4)
- [x] Première migration (`prisma migrate dev --name init`)
- [x] Générer le client Prisma et un singleton `lib/prisma.ts`

## 2. Page d'accueil (`/`)

- [x] Choix du rôle : deux boutons "Client" / "Conducteur" (`app/page.tsx`)
- [x] Redirection vers le formulaire correspondant (`/customer/form` ou `/driver/form`)
- [x] Si cookie déjà rempli pour ce rôle → passer directement à la page principale du rôle (`lib/session.ts` + `redirect()`)

## 3. Formulaire Client (`/customer/form`)

- [x] Champs : nom, numéro de téléphone (`app/customer/form/customer-form.tsx`)
- [x] Validation (nom ≥2 caractères, téléphone togolais — `lib/customers.ts`, Zod)
- [x] `POST /api/customers` — créer/mettre à jour le `Customer` en base (upsert par téléphone)
- [x] Sauvegarde dans un cookie (name, phone) à la soumission (`lib/session.ts`)
- [x] Redirection vers la page principale Client (`/customer` — stub en attendant la tâche 5)

## 4. Formulaire Conducteur (`/driver/form`)

- [x] Champs : nom, numéro de téléphone, plaque du véhicule (`app/driver/form/driver-form.tsx`)
- [x] Validation (mêmes règles + format plaque — `lib/drivers.ts`, Zod)
- [x] `POST /api/drivers` — créer/mettre à jour le `Driver` en base (upsert par téléphone)
- [x] Sauvegarde dans un cookie (name, phone, licensePlate)
- [x] Redirection vers le tableau de bord Conducteur (`/driver` — stub en attendant la tâche 7)

## 5. Page principale Client (`/customer`)

- [x] Carte interactive (Leaflet + tuiles CARTO Positron, rendu épuré — `app/customer/booking-map.tsx`)
- [x] Géolocalisation du navigateur (`navigator.geolocation`) → position actuelle sur la carte (repli sur Lomé si refusée)
- [x] Saisie de la destination : barre de recherche Nominatim style Google Maps (`destination-search.tsx`, Coss Combobox) **et** tap sur la carte ; reverse geocoding pour le nom lisible quand on tape directement sur la carte
- [x] Fonction de calcul de distance (Haversine) + formule prix (tarif de base + tarif/km) et temps (distance / vitesse moyenne) — `lib/geo.ts`
- [x] `POST /api/rides/estimate` — appel API au changement de destination pour récupérer prix + temps
- [x] Affichage du prix estimé et du temps d'arrivée
- [x] Bouton "Confirmer la course" → ouvre la modal de confirmation (Coss Dialog ; logique de confirmation réelle = tâche 6)

## 6. Modal de confirmation (Client)

- [x] Affichage par-dessus la carte : prix estimé, conducteur assigné (nom, plaque) — `app/customer/confirm-ride-dialog.tsx`
- [x] État "recherche d'un conducteur" pendant le matching
- [x] Bouton confirmer / annuler
- [x] `POST /api/rides` — à la confirmation, créer le `Ride` (status `pending`) ; sélection du `Driver` disponible le plus proche (Haversine si position connue, sinon premier disponible — voir `Driver.lat`/`lng`, à remplir par la tâche 7)
- [x] `GET /api/rides/:id` — polling du statut pendant l'attente d'acceptation (toutes les 3s)
- [x] Affichage du profil du conducteur assigné une fois la course acceptée

## 7. Tableau de bord Conducteur (`/driver`)

- [x] Toggle statut disponible / indisponible (capture la position via géolocalisation à l'activation)
- [x] `PATCH /api/drivers/:id/availability` — appel API au toggle, vérifie que le conducteur n'agit que sur son propre profil
- [x] Liste des demandes de course à proximité (en attente) — `GET /api/drivers/:id/rides`, rafraîchi par polling (5s)
- [x] Action "Accepter" / "Refuser" sur chaque demande
- [x] `PATCH /api/rides/:id` — accepter / refuser une demande (status `accepted`/`declined`)
- [x] Écran fin de course : choix du mode de paiement (cash, Flooz, T-Money) — modal Coss Dialog + RadioGroup
- [x] `PATCH /api/rides/:id` — terminer la course (status `completed` + `paymentMethod`)

## 8. Persistance côté client (cookies)

- [ ] Helper `lib/cookies.ts` pour lire/écrire les infos de session (role, name, phone, licensePlate)
- [ ] Lecture du cookie au chargement de la page d'accueil pour bypasser le formulaire

## 9. Hors périmètre (rappel, ne pas implémenter)

- Authentification / création de compte
- Historique des courses
- Paiement en ligne intégré
- Notation/avis
- Suivi de course en temps réel
