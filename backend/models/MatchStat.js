const mongoose = require('mongoose');

// Stats d'un match précis, ajouté après chaque rencontre
const matchStatSchema = new mongoose.Schema(
  {
    opponent: { type: String, required: true }, // ex: "PSG"
    competition: { type: String, default: '' }, // ex: "Ligue 1"
    date: { type: Date, required: true },
    result: { type: String, default: '' }, // ex: "2-1"
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
    rating: { type: Number, default: null }, // note sur 10, optionnel
    yellowCard: { type: Boolean, default: false },
    redCard: { type: Boolean, default: false },
    isStarter: { type: Boolean, default: true }, // titulaire ou remplaçant
  },
  { timestamps: true }
);

module.exports = mongoose.model('MatchStat', matchStatSchema);
