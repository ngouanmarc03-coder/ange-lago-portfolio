const express = require('express');
const router = express.Router();
const CareerStep = require('../models/CareerStep');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// GET /api/career → liste publique du parcours, ordonné
router.get('/', async (req, res) => {
  try {
    const steps = await CareerStep.find().sort({ order: 1, year: 1 });
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/career → ajouter une étape (admin)
router.post('/', requireAdmin, uploadImage.single('image'), async (req, res) => {
  try {
    const { year, title, description, order } = req.body;
    const step = new CareerStep({
      year,
      title,
      description,
      order: order || 0,
      imageUrl: req.file ? req.file.path : '',
      cloudinaryId: req.file ? req.file.filename : '',
    });
    await step.save();
    res.status(201).json(step);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création.' });
  }
});

// PUT /api/career/:id → modifier une étape
router.put('/:id', requireAdmin, uploadImage.single('image'), async (req, res) => {
  try {
    const { year, title, description, order } = req.body;
    const updateData = { year, title, description, order };
    if (req.file) {
      updateData.imageUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }
    const updated = await CareerStep.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Étape introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// DELETE /api/career/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await CareerStep.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Étape introuvable.' });
    if (deleted.cloudinaryId) {
      await cloudinary.uploader.destroy(deleted.cloudinaryId).catch(() => {});
    }
    res.json({ message: 'Étape supprimée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
