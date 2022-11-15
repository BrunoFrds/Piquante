//----- Configuration d'un middleware pour extraire et vérifier que le token est valide et transmission des informations de connexion aux autres middlewares ou routes -----//

// Import du package jsonwebtoken
const jwt = require("jsonwebtoken");

// Export du middleware d'authentification
module.exports = (req, res, next) => {
  // Utilisation d'un "try ... catch" pour gérer les erreurs possibles
  try {
    //-- Récupération du token --//
    // Récupération du header "Authorization" de la requête entrante, et on le split en un tableau autour de l'espace entre bearer et le token
    const token = req.headers.authorization.split(" ")[1];
    // Décodage du token avec la fonction "verify" de jsonwebtoken
    const decodedToken = jwt.verify(
      // Token récupéré
      token,
      // Clé secrète
      "RANDOM_TOKEN_SECRET"
    );
    // Récupération de l'ID de l'utilisateur à partir du token
    const userId = decodedToken.userId;
    // Ajout de "userId" à la requête afin que les différentes routes puissent l'exploiter
    req.authorize = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
