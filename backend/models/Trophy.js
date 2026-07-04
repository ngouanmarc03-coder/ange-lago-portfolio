const mongoose = require('mongoose');

const trophySchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // ex: "Meilleur buteur U18"
    competition: { type: String, default: '' }, // ex: "Championnat ivoirien"
    year: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trophy', trophySchema);
