const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    websiteUrl: { type: String, default: '' }, // lien vers leur site
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Partner', partnerSchema);
