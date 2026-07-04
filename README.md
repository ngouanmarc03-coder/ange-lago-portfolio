# Site Ange Lago — Guide de déploiement

Ce guide t'évite le problème classique : **images qui disparaissent + admin qui casse après déploiement.**

La cause de ce problème dans 95% des cas : Netlify et Railway ne gardent pas les fichiers uploadés de façon permanente. Ce projet contourne totalement ça en stockant TOUTES les images/vidéos sur **Cloudinary**, et seulement leur URL dans MongoDB. Si tu suis ce guide dans l'ordre, ça ne t'arrivera plus.

---

## Étape 1 — MongoDB Atlas (base de données)

1. Va sur https://cloud.mongodb.com avec ton compte `ngouanmarc03@gmail.com`
2. Crée un cluster **gratuit (M0)**
3. Dans "Database Access" → crée un utilisateur avec un mot de passe
4. Dans "Network Access" → ajoute `0.0.0.0/0` (autorise toutes les IP, nécessaire pour Railway)
5. Clique "Connect" → "Drivers" → copie la connection string, ça ressemble à :
   ```
   mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. Ajoute `ange-lago` comme nom de base juste après `.net/` :
   ```
   mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/ange-lago?retryWrites=true&w=majority
   ```
   → garde cette chaîne, tu en auras besoin à l'étape 3.

## Étape 2 — Cloudinary (déjà fait, tu l'as)

Va sur https://cloudinary.com/console et note ces 3 valeurs (elles sont affichées directement) :
- Cloud name
- API Key
- API Secret

## Étape 3 — Déployer le backend sur Railway

1. Pousse tout ce dossier sur GitHub (voir Étape 5 si tu ne sais pas comment)
2. Va sur https://railway.app, connecte-toi avec GitHub
3. "New Project" → "Deploy from GitHub repo" → sélectionne ton repo
4. **Important** : dans les paramètres du service, mets le "Root Directory" sur `/backend`
5. Va dans l'onglet "Variables" et ajoute toutes ces variables (une par une) :

   | Variable | Valeur |
   |---|---|
   | `MONGO_URI` | ta connection string MongoDB de l'étape 1 |
   | `CLOUDINARY_CLOUD_NAME` | ton cloud name |
   | `CLOUDINARY_API_KEY` | ta clé API |
   | `CLOUDINARY_API_SECRET` | ton secret API |
   | `ADMIN_PASSWORD` | le mot de passe que TU choisis pour te connecter à l'admin |
   | `JWT_SECRET` | une longue chaîne aléatoire (génère-la sur randomkeygen.com) |
   | `FRONTEND_URL` | laisse vide pour l'instant, tu le rempliras à l'étape 4 |

6. Railway déploie automatiquement. Une fois fini, va dans "Settings" → "Networking" → "Generate Domain"
7. Tu obtiens une URL du genre `https://ange-lago-backend-production.up.railway.app`
8. **Teste-la** : ouvre `https://ton-url.up.railway.app/api/health` dans ton navigateur. Tu dois voir `{"status":"ok","mongoConnected":true}`. Si `mongoConnected` est `false`, revérifie ta `MONGO_URI`.

## Étape 4 — Déployer le frontend sur Netlify

1. **Avant tout**, ouvre `frontend/js/config.js` et remplace la ligne :
   ```js
   const API_URL = 'http://localhost:5000/api';
   ```
   par :
   ```js
   const API_URL = 'https://ton-url.up.railway.app/api';
   ```
   (utilise l'URL Railway obtenue à l'étape 3, sans oublier `/api` à la fin)

2. Repousse ce changement sur GitHub

3. Va sur https://netlify.com, connecte-toi avec GitHub
4. "Add new site" → "Import an existing project" → sélectionne ton repo
5. **Important** : mets "Base directory" sur `frontend` et "Publish directory" sur `frontend`
6. Clique "Deploy"
7. Tu obtiens une URL du genre `https://ange-lago.netlify.app`

## Étape 5 — Reconnecter le backend au frontend (CORS)

C'est **l'étape que les gens oublient** et qui casse l'admin après déploiement :

1. Retourne sur Railway → ton service backend → Variables
2. Modifie `FRONTEND_URL` et mets l'URL Netlify obtenue à l'étape 4 :
   ```
   FRONTEND_URL=https://ange-lago.netlify.app
   ```
3. Railway redéploie automatiquement (attends ~1 minute)
4. Recharge ton site Netlify → tout doit fonctionner, y compris l'admin

## Étape 6 — Acheter et connecter ton nom de domaine

1. Achète le domaine où tu veux (Namecheap, OVH, Google Domains...)
2. Sur Netlify → "Domain settings" → "Add a domain" → entre ton domaine
3. Netlify te donne des enregistrements DNS à ajouter chez ton registrar (généralement un enregistrement A et un CNAME)
4. Une fois propagé (jusqu'à 24h), ton site est accessible sur ton propre domaine
5. **N'oublie pas** de repasser à l'étape 5 et remplacer `FRONTEND_URL` sur Railway par ton nouveau domaine (ex: `https://angelago.com`), sinon CORS bloquera à nouveau les requêtes.

---

## Pourquoi ça ne cassera plus

- Toutes les images/vidéos uploadées via l'admin partent directement vers **Cloudinary**, jamais sur le disque de Railway ou Netlify → elles ne disparaissent jamais, même après un redéploiement.
- Le frontend est 100% statique (HTML/CSS/JS) → aucune surprise d'hébergement sur Netlify.
- CORS est configuré strictement avec `FRONTEND_URL` → tant que cette variable correspond exactement à l'URL de ton site, l'admin fonctionnera toujours.

## Utilisation quotidienne de l'admin

- Va sur `https://tonsite.com/admin.html`
- Connecte-toi avec le mot de passe que tu as mis dans `ADMIN_PASSWORD`
- Tout ce que tu ajoutes (photos, actus, stats après un match...) apparaît immédiatement sur le site public
- L'admin est optimisé pour le téléphone : navigation en bas, formulaires en plein écran

## En cas de problème

- **Site blanc / rien ne charge** → vérifie que `config.js` pointe bien vers la bonne URL Railway
- **Admin refuse la connexion** → vérifie `ADMIN_PASSWORD` sur Railway
- **"Erreur CORS" dans la console du navigateur** → `FRONTEND_URL` sur Railway ne correspond pas exactement à l'URL de ton site (attention à `https://` et à ne pas avoir de `/` final)
- **Upload d'image échoue** → revérifie tes 3 identifiants Cloudinary sur Railway
