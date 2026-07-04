const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');
const MatchStat = require('../models/MatchStat');
const { uploadImage, cloudinary } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

// === STATS GLOBALES DE LA SAISON ===

// GET /api/stats/season → stats de la saison courante
router.get('/season', async (req, res) => {
  try {
    const stats = await Stats.findOne({ isCurrent: true });
    res.json(stats || {});
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/stats/season → mettre à jour les stats globales (admin)
// Crée le document s'il n'existe pas encore
router.put('/season', requireAdmin, uploadImage.single('backgroundImage'), async (req, res) => {
  try {
    const { season, matchesPlayed, goals, assists, minutesPlayed, yellowCards, redCards, distanceKm } = req.body;

    let stats = await Stats.findOne({ isCurrent: true });
    if (!stats) {
      stats = new Stats({ isCurrent: true });
    }

    stats.season = season ?? stats.season;
    stats.matchesPlayed = matchesPlayed ?? stats.matchesPlayed;
    stats.goals = goals ?? stats.goals;
    stats.assists = assists ?? stats.assists;
    stats.minutesPlayed = minutesPlayed ?? stats.minutesPlayed;
    stats.yellowCards = yellowCards ?? stats.yellowCards;
    stats.redCards = redCards ?? stats.redCards;
    stats.distanceKm = distanceKm ?? stats.distanceKm;

    if (req.file) {
      stats.backgroundImageUrl = req.file.path;
      stats.backgroundCloudinaryId = req.file.filename;
    }

    await stats.save();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

// === STATS PAR MATCH ===

// GET /api/stats/matches → liste des matchs, plus récent d'abord
router.get('/matches', async (req, res) => {
  try {
    const matches = await MatchStat.find().sort({ date: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/stats/matches → ajouter les stats d'un match (admin, après chaque match)
router.post('/matches', requireAdmin, async (req, res) => {
  try {
    const match = new MatchStat(req.body);
    await match.save();

    // Met aussi à jour automatiquement le cumul saison pour ne pas avoir à le refaire à la main
    let stats = await Stats.findOne({ isCurrent: true });
    if (!stats) stats = new Stats({ isCurrent: true });
    stats.matchesPlayed += 1;
    stats.goals += match.goals || 0;
    stats.assists += match.assists || 0;
    stats.minutesPlayed += match.minutesPlayed || 0;
    if (match.yellowCard) stats.yellowCards += 1;
    if (match.redCard) stats.redCards += 1;
    await stats.save();

    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du match.' });
  }
});

// PUT /api/stats/matches/:id → modifier un match (n'ajuste pas automatiquement le cumul,
// pour éviter les doubles comptages — l'admin réajuste le cumul saison si besoin)
router.put('/matches/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await MatchStat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Match introuvable.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

// DELETE /api/stats/matches/:id
router.delete('/matches/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await MatchStat.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Match introuvable.' });
    res.json({ message: 'Match supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
