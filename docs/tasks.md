# Tâches MVP – Taxi-Moto

> Découle de [`mvp-spec.md`](./mvp-spec.md) et [`tech-stack.md`](./tech-stack.md).

## 1. Base de données & ORM

- [ ] Initialiser Prisma (`prisma init`), configurer `DATABASE_URL` (Neon)
- [ ] Modéliser le schéma : `Client`, `Conducteur`, `Course` (voir `tech-stack.md` §4)
- [ ] Première migration (`prisma migrate dev`)
- [ ] Générer le client Prisma et un singleton `lib/prisma.ts`

## 2. Page d'accueil (`/`)

- [ ] Choix du rôle : deux boutons/cartes "Client" / "Conducteur"
- [ ] Redirection vers le formulaire correspondant (`/client/form` ou `/conducteur/form`)
- [ ] Si cookie déjà rempli pour ce rôle → passer directement à la page principale du rôle

## 3. Formulaire Client (`/client/form`)

- [ ] Champs : nom, numéro de téléphone
- [ ] Validation (nom non vide, téléphone format valide)
- [ ] `POST /api/clients` — créer/mettre à jour le client en base
- [ ] Sauvegarde dans un cookie (nom, téléphone) à la soumission
- [ ] Redirection vers la page principale Client (`/client`)

## 4. Formulaire Conducteur (`/conducteur/form`)

- [ ] Champs : nom, numéro de téléphone, plaque du véhicule
- [ ] Validation (mêmes règles + format plaque)
- [ ] `POST /api/conducteurs` — créer/mettre à jour le conducteur en base
- [ ] Sauvegarde dans un cookie (nom, téléphone, plaque)
- [ ] Redirection vers le tableau de bord Conducteur (`/conducteur`)

## 5. Page principale Client (`/client`)

- [ ] Carte interactive (Leaflet + OpenStreetMap)
- [ ] Géolocalisation du navigateur (`navigator.geolocation`) → position actuelle sur la carte
- [ ] Saisie de la destination (recherche d'adresse ou sélection sur la carte)
- [ ] Fonction de calcul de distance (Haversine) + formule prix (tarif de base + tarif/km) et temps (distance / vitesse moyenne)
- [ ] `POST /api/courses/estimation` — appel API au changement de destination pour récupérer prix + temps
- [ ] Affichage du prix estimé et du temps d'arrivée
- [ ] Bouton "Confirmer la course" → ouvre la modal de confirmation

## 6. Modal de confirmation (Client)

- [ ] Affichage par-dessus la carte : prix estimé, conducteur assigné (nom, plaque)
- [ ] État "recherche d'un conducteur" pendant le matching
- [ ] Bouton confirmer / annuler
- [ ] `POST /api/courses` — à la confirmation, créer la `Course` (statut `en_attente`) ; sélection du conducteur disponible le plus proche
- [ ] `GET /api/courses/:id` — polling du statut pendant l'attente d'acceptation
- [ ] Affichage du profil du conducteur assigné une fois la course acceptée

## 7. Tableau de bord Conducteur (`/conducteur`)

- [ ] Toggle statut disponible / indisponible
- [ ] `PATCH /api/conducteurs/:id/disponibilite` — appel API au toggle
- [ ] Liste des demandes de course à proximité (en attente)
- [ ] Action "Accepter" / "Refuser" sur chaque demande
- [ ] `PATCH /api/courses/:id` — accepter / refuser une demande (statut `acceptee`/`refusee`)
- [ ] Écran fin de course : choix du mode de paiement (cash, Flooz, T-Money)
- [ ] `PATCH /api/courses/:id` — terminer la course (statut `terminee` + `modePaiement`)

## 8. Persistance côté client (cookies)

- [ ] Helper `lib/cookies.ts` pour lire/écrire les infos de session (rôle, nom, téléphone, plaque)
- [ ] Lecture du cookie au chargement de la page d'accueil pour bypasser le formulaire

## 9. Hors périmètre (rappel, ne pas implémenter)

- Authentification / création de compte
- Historique des courses
- Paiement en ligne intégré
- Notation/avis
- Suivi de course en temps réel
