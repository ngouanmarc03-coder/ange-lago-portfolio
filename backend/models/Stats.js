const mongoose = require('mongoose');

// Un seul document = les stats globales de la saison actuelle
// Mis à jour à chaque fois depuis l'admin
const statsSchema = new mongoose.Schema(
  {
    season: { type: String, required: true, default: '2025-2026' },
    matchesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 }, // "endurance" : distance totale parcourue en km sur la saison
    backgroundImageUrl: { type: String, default: '' },
    backgroundCloudinaryId: { type: String, default: '' },
    // possibilité d'ajouter d'autres stats libres (clé/valeur) si besoin plus tard
    isCurrent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stats', statsSchema);
