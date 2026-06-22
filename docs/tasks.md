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

- [ ] Carte interactive (Leaflet + OpenStreetMap)
- [ ] Géolocalisation du navigateur (`navigator.geolocation`) → position actuelle sur la carte
- [ ] Saisie de la destination (recherche d'adresse ou sélection sur la carte)
- [ ] Fonction de calcul de distance (Haversine) + formule prix (tarif de base + tarif/km) et temps (distance / vitesse moyenne)
- [ ] `POST /api/rides/estimate` — appel API au changement de destination pour récupérer prix + temps
- [ ] Affichage du prix estimé et du temps d'arrivée
- [ ] Bouton "Confirmer la course" → ouvre la modal de confirmation

## 6. Modal de confirmation (Client)

- [ ] Affichage par-dessus la carte : prix estimé, conducteur assigné (nom, plaque)
- [ ] État "recherche d'un conducteur" pendant le matching
- [ ] Bouton confirmer / annuler
- [ ] `POST /api/rides` — à la confirmation, créer le `Ride` (status `pending`) ; sélection du `Driver` disponible le plus proche
- [ ] `GET /api/rides/:id` — polling du statut pendant l'attente d'acceptation
- [ ] Affichage du profil du conducteur assigné une fois la course acceptée

## 7. Tableau de bord Conducteur (`/driver`)

- [ ] Toggle statut disponible / indisponible
- [ ] `PATCH /api/drivers/:id/availability` — appel API au toggle
- [ ] Liste des demandes de course à proximité (en attente)
- [ ] Action "Accepter" / "Refuser" sur chaque demande
- [ ] `PATCH /api/rides/:id` — accepter / refuser une demande (status `accepted`/`declined`)
- [ ] Écran fin de course : choix du mode de paiement (cash, Flooz, T-Money)
- [ ] `PATCH /api/rides/:id` — terminer la course (status `completed` + `paymentMethod`)

## 8. Persistance côté client (cookies)

- [ ] Helper `lib/cookies.ts` pour lire/écrire les infos de session (role, name, phone, licensePlate)
- [ ] Lecture du cookie au chargement de la page d'accueil pour bypasser le formulaire

## 9. Hors périmètre (rappel, ne pas implémenter)

- Authentification / création de compte
- Historique des courses
- Paiement en ligne intégré
- Notation/avis
- Suivi de course en temps réel
