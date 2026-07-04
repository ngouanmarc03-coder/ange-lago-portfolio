const express = require('express');
const router = express.Router();
const Trophy = require('../models/Trophy');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const trophies = await Trophy.find().sort({ order: 1, year: -1 });
    res.json(trophies);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post('/', requireAdmin, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, competition, year, order } = req.body;
    const trophy = new Trophy({
      title,
      competition,
      year,
      order: order || 0,
      imageUrl: req.file ? req.file.path : '',
      cloudinaryId: req.file ? req.file.filename : '',
    });
    await trophy.save();
    res.status(201).json(trophy);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création.' });
  }
});

router.put('/:id', requireAdmin, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, competition, year, order } = req.body;
    const updateData = { title, competition, year, order };
    if (req.file) {
      updateData.imageUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }
    const updated = await Trophy.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Trophée introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Trophy.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Trophée introuvable.' });
    if (deleted.cloudinaryId) {
      await cloudinary.uploader.destroy(deleted.cloudinaryId).catch(() => {});
    }
    res.json({ message: 'Trophée supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
