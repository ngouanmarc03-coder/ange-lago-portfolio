const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { uploadImage } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// GET /api/news → liste publique des actus publiées, plus récentes d'abord
router.get('/', async (req, res) => {
  try {
    const news = await News.find({ published: true }).sort({ date: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des actualités.' });
  }
});

// GET /api/news/:id → une actu précise
router.get('/:id', async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Actualité introuvable.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/news/admin/all → toutes les actus (même non publiées) pour l'admin
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/news → créer une actu (admin uniquement), avec image optionnelle
router.post('/', requireAdmin, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, category, date, excerpt, content, published } = req.body;
    const newsItem = new News({
      title,
      category,
      date: date || Date.now(),
      excerpt,
      content,
      published: published !== 'false',
      imageUrl: req.file ? req.file.path : '',
      cloudinaryId: req.file ? req.file.filename : '',
    });
    await newsItem.save();
    res.status(201).json(newsItem);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'actualité.' });
  }
});

// PUT /api/news/:id → modifier une actu
router.put('/:id', requireAdmin, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, category, date, excerpt, content, published } = req.body;
    const updateData = { title, category, date, excerpt, content, published: published !== 'false' };

    if (req.file) {
      updateData.imageUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }

    const updated = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Actualité introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// DELETE /api/news/:id → supprimer une actu
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Actualité introuvable.' });

    if (deleted.cloudinaryId) {
      const { cloudinary } = require('../config/cloudinary');
      await cloudinary.uploader.destroy(deleted.cloudinaryId).catch(() => {});
    }

    res.json({ message: 'Actualité supprimée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
