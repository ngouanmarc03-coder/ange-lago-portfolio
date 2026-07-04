// ==========================================================================
// CONFIGURATION — AUTOMATIQUE
// ==========================================================================
// En développement, l'URL de l'API se déduit automatiquement de l'adresse
// utilisée pour ouvrir le site : si tu ouvres http://localhost:5500, l'API
// pointe vers localhost:5000. Si tu ouvres http://192.168.1.42:5500 depuis
// ton téléphone, l'API pointe automatiquement vers 192.168.1.42:5000.
// Aucune modification manuelle nécessaire, même quand ton IP change.
//
// EXCEPTION — PRODUCTION : une fois déployé sur Netlify, remplace la ligne
// ci-dessous par l'URL fixe de ton backend Railway, par exemple :
// const API_URL = 'https://ange-lago-backend.up.railway.app/api';

const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
  /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname);

const API_URL = isLocalDev
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : 'http://localhost:5000/api'; // ⚠️ remplace cette ligne par ton URL Railway au déploiement

window.API_URL = API_URL;
