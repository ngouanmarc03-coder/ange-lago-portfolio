const jwt = require('jsonwebtoken');

// Vérifie que la requête vient bien de l'admin connecté (token valide)
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès refusé. Connecte-toi à l\'admin.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expirée, reconnecte-toi.' });
  }
}

module.exports = { requireAdmin };
