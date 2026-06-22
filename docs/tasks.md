# Tâches MVP – Taxi-Moto

> Découle de [`mvp-spec.md`](./mvp-spec.md) et [`tech-stack.md`](./tech-stack.md).
> Les docs sont en français, mais tout le code (routes, modèles, variables, schéma DB) est en anglais.

## 1. Base de données & ORM

- [x] Initialiser Prisma (`prisma init`), configurer `DATABASE_URL` (Neon)
- [x] Modéliser le schéma : `Customer`, `Driver`, `Ride` (voir `tech-stack.md` §4)
- [x] Première migration (`prisma migrate dev --name init`)
- [x] Générer le client Prisma et un singleton `lib/prisma.ts`

## 2. Page d'accueil (`/`)

- [ ] Choix du rôle : deux boutons/cartes "Client" / "Conducteur"
- [ ] Redirection vers le formulaire correspondant (`/customer/form` ou `/driver/form`)
- [ ] Si cookie déjà rempli pour ce rôle → passer directement à la page principale du rôle

## 3. Formulaire Client (`/customer/form`)

- [ ] Champs : nom, numéro de téléphone
- [ ] Validation (nom non vide, téléphone format valide)
- [ ] `POST /api/customers` — créer/mettre à jour le `Customer` en base
- [ ] Sauvegarde dans un cookie (name, phone) à la soumission
- [ ] Redirection vers la page principale Client (`/customer`)

## 4. Formulaire Conducteur (`/driver/form`)

- [ ] Champs : nom, numéro de téléphone, plaque du véhicule
- [ ] Validation (mêmes règles + format plaque)
- [ ] `POST /api/drivers` — créer/mettre à jour le `Driver` en base
- [ ] Sauvegarde dans un cookie (name, phone, licensePlate)
- [ ] Redirection vers le tableau de bord Conducteur (`/driver`)

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
