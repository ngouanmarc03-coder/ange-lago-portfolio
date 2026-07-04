const mongoose = require('mongoose');

// Une étape du parcours : ex "2023 - Rejoint le centre de formation OM"
const careerStepSchema = new mongoose.Schema(
  {
    year: { type: String, required: true }, // "2023" ou "2023-2024"
    title: { type: String, required: true }, // ex: "Olympique de Marseille"
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerStep', careerStepSchema);
