const mongoose = require('mongoose');

// Petits badges avec photo + lien, affichés en pied de page
// (club actuel, sélection nationale, académie de formation, etc.)
const affiliationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    url: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Affiliation', affiliationSchema);
