const express = require('express');
const router = express.Router();
const GalleryItem = require('../models/GalleryItem');
const { uploadMixed, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// GET /api/gallery → tous les médias, plus récents d'abord
router.get('/', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/gallery → ajouter une photo ou vidéo
router.post('/', requireAdmin, uploadMixed.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Un fichier est requis.' });

    const isVideo = req.file.mimetype.startsWith('video/');
    const { caption, category, order } = req.body;

    const item = new GalleryItem({
      type: isVideo ? 'video' : 'image',
      mediaUrl: req.file.path,
      thumbnailUrl: isVideo ? req.file.path.replace(/\.(mp4|mov|webm)$/, '.jpg') : '',
      cloudinaryId: req.file.filename,
      caption: caption || '',
      category: category || 'general',
      order: order || 0,
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout.' });
  }
});

// PUT /api/gallery/:id → modifier légende/catégorie (pas le fichier, on supprime/recrée si besoin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { caption, category, order } = req.body;
    const updated = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { caption, category, order },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Élément introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Élément introuvable.' });
    if (deleted.cloudinaryId) {
      await cloudinary.uploader
        .destroy(deleted.cloudinaryId, { resource_type: deleted.type === 'video' ? 'video' : 'image' })
        .catch(() => {});
    }
    res.json({ message: 'Élément supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
