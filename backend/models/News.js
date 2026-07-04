const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: '' }, // ex: "Formation", "Mercato"
    date: { type: Date, default: Date.now },
    excerpt: { type: String, default: '' }, // résumé court
    content: { type: String, required: true }, // texte complet
    imageUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);
