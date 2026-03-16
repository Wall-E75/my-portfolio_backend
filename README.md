# Portfolio Backend API

API REST backend pour le formulaire de contact d'un portfolio. Gère le stockage des messages, la déduplication par email, et l'envoi de notifications par email (propriétaire + confirmation expéditeur).

## Stack technique

- **Runtime** — Node.js
- **Framework** — Express.js
- **Base de données** — MongoDB Atlas via Mongoose
- **Email** — Nodemailer (Gmail SMTP)
- **Déploiement** — Vercel (serverless)

## Fonctionnalités

- **Gestion des contacts** — stockage en MongoDB ; les messages successifs d'un même email sont ajoutés au document existant plutôt que de créer un doublon
- **Double notification email** — envoi d'une notification HTML au propriétaire et d'un email de confirmation à l'expéditeur à chaque nouveau message
- **Validation des entrées** — champs requis, format email (regex), limite de longueur de message (200 caractères)
- **Rate limiting** — 3 requêtes par IP toutes les 15 minutes sur `POST /message`
- **CORS** — liste d'origines autorisées configurable via variable d'environnement

## Architecture

```
routes/index.js              ← Endpoints de l'API
  ├── models/messages.js           ← Schéma Mongoose (contacts + messages imbriqués)
  ├── services/emailService.js     ← Logique Nodemailer (notification + confirmation)
  └── modules/
        ├── checkBody.js              ← Validation des champs requis
        └── rateLimitConfig.js        ← Configuration express-rate-limit
```

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Informations sur l'API |
| `GET` | `/all` | Récupérer tous les contacts et messages |
| `POST` | `/message` | Envoyer un nouveau message |

### `POST /message`

**Corps de la requête :**
```json
{
  "firstname": "Jane",
  "lastname": "Doe",
  "email": "jane@example.com",
  "messages": "Bonjour !"
}
```

**Réponse :**
```json
{
  "result": true,
  "response": "Nouveau contact créé",
  "messageId": "..."
}
```

## Installation

```bash
# Installer les dépendances
yarn install

# Démarrer le serveur
yarn start
```

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
CONNECTION_STRING=mongodb+srv://<user>:<password>@cluster/<db>
ALLOWED_ORIGINS=http://localhost:3001,https://votre-frontend.vercel.app
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application-gmail
NOTIFICATION_EMAIL=proprietaire@example.com
```

> Gmail nécessite un [mot de passe d'application](https://myaccount.google.com/apppasswords) — pas votre mot de passe habituel.

## Déploiement

Déployé sur Vercel via `vercel.json`. Toutes les routes sont gérées par `app.js` en tant que fonction serverless.

Définir les variables d'environnement dans le tableau de bord Vercel avant de déployer.
