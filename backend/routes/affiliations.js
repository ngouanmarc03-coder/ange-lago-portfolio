const express = require('express');
const router = express.Router();
const Affiliation = require('../models/Affiliation');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// GET /api/affiliations → liste publique, ordonnée
router.get('/', async (req, res) => {
  try {
    const items = await Affiliation.find().sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/affiliations → ajouter un badge (admin)
router.post('/', requireAdmin, uploadImage.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Le logo est requis.' });
    const { name, url, order } = req.body;
    const item = new Affiliation({
      name,
      url,
      order: order || 0,
      logoUrl: req.file.path,
      cloudinaryId: req.file.filename,
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création.' });
  }
});

// PUT /api/affiliations/:id
router.put('/:id', requireAdmin, uploadImage.single('logo'), async (req, res) => {
  try {
    const { name, url, order } = req.body;
    const updateData = { name, url, order };
    if (req.file) {
      updateData.logoUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }
    const updated = await Affiliation.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Badge introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// DELETE /api/affiliations/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Affiliation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Badge introuvable.' });
    if (deleted.cloudinaryId) await cloudinary.uploader.destroy(deleted.cloudinaryId).catch(() => {});
    res.json({ message: 'Badge supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
