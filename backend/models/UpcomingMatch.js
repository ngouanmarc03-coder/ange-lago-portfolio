const mongoose = require('mongoose');

// Un prochain match à venir, avec les infos de composition
const upcomingMatchSchema = new mongoose.Schema(
  {
    opponent: { type: String, required: true },
    opponentLogoUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
    competition: { type: String, default: '' },
    date: { type: Date, required: true },
    venue: { type: String, default: '' }, // "Domicile" / "Extérieur" / lieu précis
    isLagoStarter: { type: Boolean, default: null }, // null = pas encore annoncé
    lineupNotes: { type: String, default: '' }, // texte libre : compo, infos, contexte
    backgroundImageUrl: { type: String, default: '' },
    backgroundCloudinaryId: { type: String, default: '' },
    active: { type: Boolean, default: true }, // permet de masquer un match passé sans le supprimer
  },
  { timestamps: true }
);

module.exports = mongoose.model('UpcomingMatch', upcomingMatchSchema);
