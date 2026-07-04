const express = require('express');
const router = express.Router();
const Hero = require('../models/Hero');
const { uploadMixed, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// GET /api/hero → liste publique des slides actifs, ordonnés
router.get('/', async (req, res) => {
  try {
    const heroes = await Hero.find({ active: true }).sort({ order: 1 });
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/hero/admin/all → tous les slides (actifs ou non) pour l'admin
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const heroes = await Hero.find().sort({ order: 1 });
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/hero → ajouter un slide (image ou vidéo au choix, l'admin choisit le fichier)
router.post('/', requireAdmin, uploadMixed.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Un fichier image ou vidéo est requis.' });

    const isVideo = req.file.mimetype.startsWith('video/');
    const { title, subtitle, order, active } = req.body;

    const hero = new Hero({
      type: isVideo ? 'video' : 'image',
      mediaUrl: req.file.path,
      cloudinaryId: req.file.filename,
      title: title || '',
      subtitle: subtitle || '',
      order: order || 0,
      active: active !== 'false',
    });
    await hero.save();
    res.status(201).json(hero);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création du slide.' });
  }
});

// PUT /api/hero/:id → modifier un slide
router.put('/:id', requireAdmin, uploadMixed.single('media'), async (req, res) => {
  try {
    const { title, subtitle, order, active } = req.body;
    const updateData = { title, subtitle, order, active: active !== 'false' };

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      updateData.type = isVideo ? 'video' : 'image';
      updateData.mediaUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }

    const updated = await Hero.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Slide introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// DELETE /api/hero/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Hero.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Slide introuvable.' });
    if (deleted.cloudinaryId) {
      await cloudinary.uploader
        .destroy(deleted.cloudinaryId, { resource_type: deleted.type === 'video' ? 'video' : 'image' })
        .catch(() => {});
    }
    res.json({ message: 'Slide supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
