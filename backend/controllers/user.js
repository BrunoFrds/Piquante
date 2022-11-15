//----- Création d'un fichier de contrôleur pour les users pour configurer les différentes fonctions qui seront utilisées pour la création et la connection des users -----//

// Import du package bcrypt (package de chiffrement, utilisé pour chiffer et créer un hash des passwords user)
const bcrypt = require("bcrypt");

// Import du package jsonwebtoken (pour créer et vérifier les tokens d'authentification)
const jwt = require("jsonwebtoken");

// Import du modèle user
const modelUser = require("../models/user");

// Fonction pour l'enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
  // Hachage du mot de passe (On passe comme permier argument le password du corps de la requête qui passe par le frontend / Cb de fois on éxécute l'algorythme de hachage)
  bcrypt
    .hash(req.body.password, 10)
    // Récupération du hash du password, qu'on va enregistrer dans un nouveau User, qui sera enregistré dans la base de donnée
    .then((hash) => {
      // Création du nouvel user avec le modèle Mongoose
      const newUser = new modelUser({
        // On fournit comme email, celui addressé dans le corps de la requête
        email: req.body.email,
        // On enregistre comme password le hash créé plus haut
        password: hash,
      });
      // Enregistrement du nouvel utilisateur dans la base de données
      newUser
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur crée !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    // On capte l'erreur
    .catch((error) => res.status(500).json({ error }));
};

// Fonction pour la connection d'utilisateurs
exports.login = (req, res, next) => {
  // Utilisation du modèle Mongoose pour vérifier si l'email entré correspond à un utilisateur existant
  modelUser
    .findOne({ email: req.body.email })
    .then((user) => {
      // Envoie d'une erreur 401 (unauthorized) si il n'y a pas de correspondance
      if (user === null) {
        res
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte !" });
      } else {
        // L'email de l'user existe dans la base de données
        bcrypt
          // Utilisation de la fonction "compare" de Bcrypt pour comparer le password entré avec celui enregistré dans la base de données
          .compare(req.body.password, user.password)
          .then((valid) => {
            // Envoie d'une erreur 401 (unauthorized) si il n'y a pas de correspondance
            if (!valid) {
              res.status(401).json({
                message: "Paire identifiant/mot de passe incorrecte !",
              });
              // Renvoie d'une réponse 200 contenant l'id de l'user et un token
            } else {
              res.status(200).json({
                userId: user._id,
                // Utilisation de la fonction "sign" de jsonwebtoken pour chiffrer un nouveau token
                token: jwt.sign(
                  // 1er paramètre : l'ID de l'utilisateur
                  { userId: user._id },
                  // 2e paramètre : chaîne secrète de développement temporaire pour crypter le token
                  "RANDOM_TOKEN_SECRET",
                  // 3e paramètre : durée de validité
                  {
                    expiresIn: "24h",
                  }
                ),
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
