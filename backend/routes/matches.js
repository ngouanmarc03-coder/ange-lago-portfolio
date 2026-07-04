const express = require('express');
const router = express.Router();
const UpcomingMatch = require('../models/UpcomingMatch');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// GET /api/matches → prochains matchs actifs, triés par date la plus proche
router.get('/', async (req, res) => {
  try {
    const matches = await UpcomingMatch.find({ active: true }).sort({ date: 1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/matches/admin/all → tous les matchs (admin)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const matches = await UpcomingMatch.find().sort({ date: 1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/matches → ajouter un prochain match
router.post(
  '/',
  requireAdmin,
  uploadImage.fields([
    { name: 'opponentLogo', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { opponent, competition, date, venue, isLagoStarter, lineupNotes, active } = req.body;
      const match = new UpcomingMatch({
        opponent,
        competition,
        date,
        venue,
        lineupNotes,
        active: active !== 'false',
        isLagoStarter: isLagoStarter === 'true' ? true : isLagoStarter === 'false' ? false : null,
        opponentLogoUrl: req.files?.opponentLogo?.[0]?.path || '',
        cloudinaryId: req.files?.opponentLogo?.[0]?.filename || '',
        backgroundImageUrl: req.files?.backgroundImage?.[0]?.path || '',
        backgroundCloudinaryId: req.files?.backgroundImage?.[0]?.filename || '',
      });
      await match.save();
      res.status(201).json(match);
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la création du match.' });
    }
  }
);

// PUT /api/matches/:id → modifier un match
router.put(
  '/:id',
  requireAdmin,
  uploadImage.fields([
    { name: 'opponentLogo', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { opponent, competition, date, venue, isLagoStarter, lineupNotes, active } = req.body;
      const updateData = {
        opponent,
        competition,
        date,
        venue,
        lineupNotes,
        active: active !== 'false',
        isLagoStarter: isLagoStarter === 'true' ? true : isLagoStarter === 'false' ? false : null,
      };
      if (req.files?.opponentLogo?.[0]) {
        updateData.opponentLogoUrl = req.files.opponentLogo[0].path;
        updateData.cloudinaryId = req.files.opponentLogo[0].filename;
      }
      if (req.files?.backgroundImage?.[0]) {
        updateData.backgroundImageUrl = req.files.backgroundImage[0].path;
        updateData.backgroundCloudinaryId = req.files.backgroundImage[0].filename;
      }
      const updated = await UpcomingMatch.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updated) return res.status(404).json({ error: 'Match introuvable.' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la modification.' });
    }
  }
);

// DELETE /api/matches/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await UpcomingMatch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Match introuvable.' });
    if (deleted.cloudinaryId) await cloudinary.uploader.destroy(deleted.cloudinaryId).catch(() => {});
    if (deleted.backgroundCloudinaryId) await cloudinary.uploader.destroy(deleted.backgroundCloudinaryId).catch(() => {});
    res.json({ message: 'Match supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
