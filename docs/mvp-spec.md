# Spécifications MVP – Taxi-Moto

> Document de référence basé sur le rapport de prototypage de SESSOU Jean de Dieu & AGBA Pamela.

## 1. Concept

Application web responsive de réservation de taxi-moto, accessible depuis n'importe quel navigateur sans installation. Elle propose deux interfaces distinctes : **Client** et **Conducteur**.

## 2. Rôles et flux utilisateurs

### 2.1 Flux Client

1. Choisit le rôle "Client" sur la page d'accueil
2. Saisit son nom et son numéro de téléphone
3. Visualise une carte avec sa position actuelle
4. Saisit sa destination
5. Consulte le prix estimé et le temps d'arrivée
6. Confirme la course
7. Reçoit le profil du conducteur assigné
8. Suit le conducteur en temps réel sur la carte

### 2.2 Flux Conducteur

1. Choisit le rôle "Conducteur" sur la page d'accueil
2. Saisit son nom, son numéro de téléphone et sa plaque de véhicule
3. Active son statut "disponible"
4. Reçoit les demandes de course à proximité
5. Accepte ou refuse la course
6. Reçoit le paiement (cash, Flooz ou T-Money) à la fin de la course

## 3. Écrans principaux

| Écran | Description |
|---|---|
| Page d'accueil | Choix du rôle (Client ou Conducteur) |
| Formulaire | Collecte des informations selon le rôle choisi |
| Page principale Client | Carte interactive pour saisir la destination et suivre le conducteur en temps réel |
| Modal de confirmation | Affiché par-dessus la carte avec le prix estimé et le conducteur assigné, avant confirmation de la course |
| Tableau de bord Conducteur | Gestion du statut (disponible/indisponible) et des demandes de course reçues |

## 4. Fonctionnalités

- **Sans création de compte** : les informations du formulaire sont sauvegardées dans les cookies du navigateur pour éviter une nouvelle saisie à chaque visite
- **Carte interactive** avec géolocalisation
- **Matching client-conducteur** par proximité
- **Estimation du prix** selon la distance
- **Suivi de course en temps réel**
- **Paiement** : cash, Flooz ou T-Money à la fin de la course

## 5. Données collectées

### Client
- Nom
- Numéro de téléphone
- Destination (saisie sur la carte)

### Conducteur
- Nom
- Numéro de téléphone
- Plaque du véhicule
- Statut (disponible / indisponible)

## 6. Hors périmètre du MVP

- Création de compte avec authentification
- Historique des courses
- Paiement en ligne intégré (carte bancaire)
- Notation/avis des conducteurs et clients
