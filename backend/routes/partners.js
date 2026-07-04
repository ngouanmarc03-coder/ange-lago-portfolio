const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find().sort({ order: 1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post('/', requireAdmin, uploadImage.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Le logo est requis.' });
    const { name, websiteUrl, order } = req.body;
    const partner = new Partner({
      name,
      websiteUrl,
      order: order || 0,
      logoUrl: req.file.path,
      cloudinaryId: req.file.filename,
    });
    await partner.save();
    res.status(201).json(partner);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création.' });
  }
});

router.put('/:id', requireAdmin, uploadImage.single('logo'), async (req, res) => {
  try {
    const { name, websiteUrl, order } = req.body;
    const updateData = { name, websiteUrl, order };
    if (req.file) {
      updateData.logoUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }
    const updated = await Partner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Partenaire introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Partner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Partenaire introuvable.' });
    if (deleted.cloudinaryId) {
      await cloudinary.uploader.destroy(deleted.cloudinaryId).catch(() => {});
    }
    res.json({ message: 'Partenaire supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
