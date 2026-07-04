const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// GET /api/profile → infos publiques du joueur
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        fullName: 'Ange Lago',
        position: 'Attaquant',
        birthDate: new Date('2004-12-27'),
        birthPlace: 'Yassap, Côte d\'Ivoire',
        nationality: 'Ivoirienne',
        club: 'Olympique de Marseille',
        clubUrl: 'https://www.om.fr',
      });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/profile → modifier le profil (admin), photo de profil + logo club optionnels
router.put(
  '/',
  requireAdmin,
  uploadImage.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'clubLogo', maxCount: 1 },
    { name: 'contactHeroImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let profile = await Profile.findOne();
      if (!profile) profile = new Profile();

      const fields = [
        'fullName', 'position', 'birthDate', 'birthPlace', 'nationality',
        'club', 'clubUrl', 'bio', 'instagramUrl', 'facebookUrl', 'youtubeUrl',
        'height', 'foot', 'contactHeroTitle', 'contactHeroSubtitle', 'contactHeroButtonLabel',
        'agentName', 'agentEmail', 'agentPhone', 'agentInstagramUrl', 'agentFacebookUrl',
      ];
      fields.forEach((field) => {
        if (req.body[field] !== undefined) profile[field] = req.body[field];
      });

      if (req.body.hasActiveStory !== undefined) {
        profile.hasActiveStory = req.body.hasActiveStory === 'true' || req.body.hasActiveStory === true;
      }

      if (req.files?.photo?.[0]) {
        profile.profileImageUrl = req.files.photo[0].path;
        profile.cloudinaryId = req.files.photo[0].filename;
      }
      if (req.files?.clubLogo?.[0]) {
        profile.clubLogoUrl = req.files.clubLogo[0].path;
        profile.clubLogoCloudinaryId = req.files.clubLogo[0].filename;
      }
      if (req.files?.contactHeroImage?.[0]) {
        profile.contactHeroImageUrl = req.files.contactHeroImage[0].path;
        profile.contactHeroImageCloudinaryId = req.files.contactHeroImage[0].filename;
      }

      await profile.save();
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
    }
  }
);

module.exports = router;
