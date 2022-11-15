//----- Création d'un modèle de données pour les sauces -----//

// Import de Mongoose
const mongoose = require("mongoose");

// Création du schèma de données pour les sauces en utilisant la fonction "schema()" de Mongoose
const sauceSchema = mongoose.Schema({
  // Objet avec les différents champs nécessaire pour le schéma
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number },
  dislikes: { type: Number },
  usersLiked: [{ type: String }],
  usersDisliked: [{ type: String }],
});

// Export du schéma sous forme de modèle (nom du modèle, schéma)
module.exports = mongoose.model("sauces", sauceSchema);
