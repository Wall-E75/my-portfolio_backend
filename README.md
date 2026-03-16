# Portfolio Backend API

API REST backend pour le formulaire de contact d'un portfolio. Gère le stockage persistant des messages, la déduplication par email, et l'envoi de notifications par email.

## Stack technique

- **Runtime** — Node.js
- **Framework** — Express.js
- **Base de données** — MongoDB Atlas via Mongoose
- **Email** — Nodemailer (Gmail SMTP)
- **Déploiement** — Vercel (serverless)

## Choix techniques

### Pourquoi une base de données ?

Un simple envoi d'email aurait suffi pour le besoin immédiat. Le choix de persister les messages en MongoDB est délibéré :

- **Historique complet** — tous les échanges avec un contact sont accessibles et regroupés, indépendamment de l'état de la boîte mail
- **Déduplication** — un même contact qui envoie plusieurs messages est reconnu par son email ; ses messages sont agrégés dans un seul document plutôt que dispersés
- **Extensibilité** — la structure permet d'ajouter facilement un backoffice (marquer comme lu, répondre, filtrer) sans migration complexe

### Pourquoi le double email ?

- **Notification au propriétaire** — alerte immédiate à chaque nouveau message
- **Confirmation à l'expéditeur** — améliore l'expérience utilisateur et évite les envois en double par incertitude

Les emails sont non bloquants : un échec d'envoi ne renvoie pas d'erreur au client, la sauvegarde en base reste prioritaire.

## Fonctionnalités

- **Gestion des contacts** — stockage en MongoDB ; les messages successifs d'un même email sont ajoutés au document existant
- **Double notification email** — notification HTML au propriétaire + confirmation à l'expéditeur
- **Validation des entrées** — champs requis, format email (regex), limite de 200 caractères
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

## Endpoint

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Informations sur l'API |
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

# Mode développement (rechargement automatique)
yarn dev

# Mode production
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
