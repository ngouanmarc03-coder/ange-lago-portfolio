const mongoose = require('mongoose');

// Un seul document contenant les infos générales du joueur
const profileSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: 'Ange Lago' },
    position: { type: String, default: 'Attaquant' },
    birthDate: { type: Date },
    birthPlace: { type: String, default: 'Yassap, Côte d\'Ivoire' },
    nationality: { type: String, default: 'Ivoirienne' },
    club: { type: String, default: 'Olympique de Marseille' },
    clubUrl: { type: String, default: 'https://www.om.fr' },
    clubLogoUrl: { type: String, default: '' },
    clubLogoCloudinaryId: { type: String, default: '' },
    bio: { type: String, default: '' },
    profileImageUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
    height: { type: String, default: '' },
    foot: { type: String, default: '' },

    // Réseaux sociaux du joueur
    instagramUrl: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    hasActiveStory: { type: Boolean, default: false }, // activé manuellement depuis l'admin

    // Hero de contact
    contactHeroImageUrl: { type: String, default: '' },
    contactHeroImageCloudinaryId: { type: String, default: '' },
    contactHeroTitle: { type: String, default: 'Contacter Ange Lago' },
    contactHeroSubtitle: { type: String, default: 'Pour une demande professionnelle, un sponsoring ou toute autre question.' },
    contactHeroButtonLabel: { type: String, default: 'Contacter' },

    // Contact de l'agent (affiché dans la section contact, à part du formulaire)
    agentName: { type: String, default: '' },
    agentEmail: { type: String, default: '' },
    agentPhone: { type: String, default: '' },
    agentInstagramUrl: { type: String, default: '' },
    agentFacebookUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
