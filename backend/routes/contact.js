const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { requireAdmin } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Limite pour éviter le spam du formulaire
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: { error: 'Trop de messages envoyés. Réessaie plus tard.' },
});

// POST /api/contact → envoyer un message (public, visiteurs du site)
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nom, email et message sont requis.' });
    }
    const contactMessage = new ContactMessage({ name, email, subject, message });
    await contactMessage.save();
    res.status(201).json({ message: 'Message envoyé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

// GET /api/contact → liste des messages reçus (admin uniquement)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/contact/:id/read → marquer comme lu
router.put('/:id/read', requireAdmin, async (req, res) => {
  try {
    const updated = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/contact/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
