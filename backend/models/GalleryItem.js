const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    mediaUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' }, // pour les vidéos, une miniature
    cloudinaryId: { type: String, required: true },
    caption: { type: String, default: '' },
    category: { type: String, default: 'general' }, // ex: "match", "entrainement", "vie privée"
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
