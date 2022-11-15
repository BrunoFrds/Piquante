//----- Création de l'application Express (framework reposant sur Node, qui facilite la création et la gestion des serveurs Node, nous permettant de déployer les API beaucoup plus rapidement) -----//

// Import d'Express pour créer l'application
const express = require("express");

// Import du package cors pour activer CORS avec les diverses options
const cors = require("cors");

// Import de body-parser pour pouvoir lire les requêtes POST
const bodyParser = require("body-parser");

// Import de Mongoose pour faciliter les intéractions avec la base de données
const mongoose = require("mongoose");

// Acces au path du serveur
const path = require("path");

// Import de Dotenv
require("dotenv").config();

// Import des routes sauces.js
const saucesRoutes = require("./routes/sauces");

// Import des routes user.js
const userRoutes = require("./routes/user");

// Connection de l'API au cluster MongoDB
mongoose
  .connect(process.env.DB_MOI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Création de l'application en faisant appel à la méthode Express
const app = express();

// Activation des requêtes CORS
app.use(cors());

// Mise à disposition du body des requêtes qui ont comme Content-type "application/json" sur l'objet req
app.use(bodyParser.json());

// Enregistrement de la route sauce sur l'application
app.use("/api/sauces", saucesRoutes);

// Enregistrement de la route user sur l'application
app.use("/api/auth", userRoutes);

// Gestion de la ressource "images" de manière statique à chaque fois qu'Express reçoit une requête vers la route "/images"
app.use("/images", express.static(path.join(__dirname, "images")));

// Export de l'application afin d'y accéder depuis les autres fichiers
module.exports = app;
