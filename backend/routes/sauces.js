//----- Création d'un routeur pour y enregistrer nos routes pour les sauces -----//

// Import d'Express
const express = require("express");

// Import du middleware auth.js afin de l'appliquer à nos routes
const authorize = require("../middleware/authorize");

// Import du middleware multer-config.js afin de l'appliquer à notre route POST
const multer = require("../middleware/multer-config");

// Création d'un routeur avec la méthode "Router" d'Express
const router = express.Router();

// Import du controlleur sauces afin de l'appliquer à nos routes
const saucesCtrl = require("../controllers/sauces");

// Enregistrement des différentes routes dans le routeur
router.get("/", authorize, saucesCtrl.getAllSauces);
router.post("/", authorize, multer, saucesCtrl.createSauce);
router.get("/:id", authorize, saucesCtrl.getOneSauce);
router.put("/:id", authorize, multer, saucesCtrl.modifySauce);
router.delete("/:id", authorize, saucesCtrl.deleteSauce);

router.post("/:id/like", authorize, saucesCtrl.likeDislike);

// Export du routeur de ce fichier
module.exports = router;
