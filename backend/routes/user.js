//----- Création d'un routeur pour y enregistrer nos routes pour les users -----//

// Import d'Express afin de créer un routeur
const express = require("express");

// Création du routeur avec la fonction "Router" d'Express
const router = express.Router();

// Association des fonctions dans le controlleur, aux différentes routes
const userCtrl = require("../controllers/user");

// Création des routes
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

// Export du routeur pour pouvoir l'importer dans app.js
module.exports = router;
