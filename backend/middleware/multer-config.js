//----- Configuration d'un middleware de gestion des fichiers pour pouvoir implémenter le téléchargement des images -----//

// Import de multer (package de gestion de fichiers pour pouvoir implémenter les téléchargements de fichiers)
const multer = require("multer");

// Création d'un objet afin de créer les différentes extensions des fichiers à partir des MIME types
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Utilisation de la méthode "diskStorage()" de multer pour configurer le chemin et le nom de fichier pour les fichiers entrants
const storage = multer.diskStorage({
  //-- L'objet de configuration à besoin de deux fonctions --//
  // Fonction "destination" indiquant à multer d'enregistrer les fichiers dans le dossier "images"
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  // Fonction "filename" indiquant à multer ..
  filename: (req, file, callback) => {
    // .. d'utiliser le nom d'origine et de remplacer les espaces par des '_'
    const name = file.originalname.split(" ").join("_");
    // .. d'utiliser la constante MIME_TYPE pour résoudre l'extension de fichier appropriée
    const extension = MIME_TYPES[file.mimetype];
    // .. et d'ajouter un timestamp "Date.now"
    callback(null, name + Date.now() + "." + extension);
  },
});

// Export du middleware multer configuré, en faisant appel à la méthode "multer", en lui passant la constante storage et en indiquant à multer qu'il s'agit uniquement de fichiers "image" grâce sa méthode "single()"
module.exports = multer({ storage: storage }).single("image");
