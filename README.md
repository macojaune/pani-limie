# Pani Limyè

## Description du projet

Pani Limyè est une application web destinée à cartographier les coupures d'électricité du réseau EDF en Guadeloupe liées aux mouvements sociaux et grèves. L'objectif est de fournir une information en temps réel aux utilisateurs sur l'état du réseau électrique dans différentes zones de l'île.

## Technologies utilisées

- Frontend : React avec Vite
- Backend : Hono

## Prérequis

- Node.js (version 14.0.0 ou supérieure)
- npm (normalement installé avec Node.js)

## Installation

1. Clonez le dépôt :
   ```
   git clone https://github.com/votre-username/pani-limie.git
   cd pani-limye
   ```

2. Installez les dépendances pour le frontend et le backend :
   ```
   # Installer les dépendances du frontend
   cd frontend
   npm install

   # Installer les dépendances du backend
   cd ../backend
   npm install
   ```

## Configuration

1. Créez un fichier `.env` dans le dossier `backend` et configurez les variables d'environnement nécessaires :
   ```
   PORT=3000
   API_KEY=votre_clé_api
   ```

2. Créez un fichier `.env` dans le dossier `frontend` si nécessaire pour les variables d'environnement spécifiques au frontend.

## Lancement de l'application

1. Démarrez le backend :
   ```
   cd backend
   npm run dev
   ```

2. Dans un nouveau terminal, démarrez le frontend :
   ```
   cd frontend
   npm run dev
   ```

3. Ouvrez votre navigateur et accédez à `http://localhost:5173` (ou le port indiqué par Vite).

## Déploiement

L'application est actuellement déployée sur Netlify à l'adresse : https://pani-limie.netlify.app

Pour déployer une nouvelle version :

1. Construisez le frontend :
   ```
   cd frontend
   npm run build
   ```

2. Déployez le dossier `dist` généré sur Netlify.

3. Assurez-vous que votre backend est déployé sur un service compatible avec Hono (comme Vercel, Deno Deploy, ou un serveur Node.js traditionnel).

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à proposer une pull request.

## Licence

[Insérez ici le type de licence choisi pour votre projet]

## Contact

@macojaune sur tous les réseaux, sens-toi libre de DM pour toute suggestion !

(Readme entière rédigé par Claude.ai)
