require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.set('trust proxy', 1);

// === CORS ===
// En développement (NODE_ENV=development) : tout le réseau local est autorisé
// automatiquement (localhost + IP type 192.168.x.x, 10.x.x.x), donc pas besoin
// de changer FRONTEND_URL à chaque fois que tu testes depuis ton téléphone.
// En production, seul FRONTEND_URL (ton domaine Netlify/final) est autorisé.
const isDev = process.env.NODE_ENV !== 'production';
const localNetworkRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman, apps mobiles, etc.
      if (isDev && localNetworkRegex.test(origin)) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Non autorisé par CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Connexion MongoDB ===
mongoose
  .connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur de connexion MongoDB :', err.message));

// === Routes ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hero', require('./routes/hero'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/affiliations', require('./routes/affiliations'));
app.use('/api/news', require('./routes/news'));
app.use('/api/career', require('./routes/career'));
app.use('/api/trophies', require('./routes/trophies'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/contact', require('./routes/contact'));

// Route de test pour vérifier que le serveur tourne bien
app.get('/', (req, res) => {
  res.json({ message: 'API Ange Lago — en ligne ✅' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Gestion des erreurs globales (évite que le serveur crash silencieusement)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  console.log(`🚀 Serveur démarré`);
  console.log(`   Local:   http://localhost:${PORT}`);
  Object.values(nets).flat().forEach((net) => {
    if (net.family === 'IPv4' && !net.internal) {
      console.log(`   Réseau:  http://${net.address}:${PORT}`);
    }
  });
});
