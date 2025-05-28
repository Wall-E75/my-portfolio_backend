const rateLimit = require('express-rate-limit');

// Configuration rate limiting pour les messages
const messageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 messages par IP toutes les 15 minutes
  message: { 
    result: false, 
    message: 'Trop de messages envoyés. Réessayez dans 15 minutes.' 
  },
  standardHeaders: true, // Headers standard
  legacyHeaders: false,
  // Utilise l'IP pour identifier l'utilisateur
  keyGenerator: (req) => {
    return req.ip;
  },
 
});

module.exports = {
  messageRateLimit
};