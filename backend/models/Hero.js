const mongoose = require('mongoose');

// Un "hero" = une diapositive en haut du site (comme sur messi.com)
// Peut être une image OU une vidéo, avec titre/sous-titre optionnels
const heroSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    mediaUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true }, // pour pouvoir supprimer sur Cloudinary
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    order: { type: Number, default: 0 }, // ordre d'affichage dans le carrousel
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hero', heroSchema);
