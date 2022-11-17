//----- Création d'un fichier de contrôleur pour les sauces pour exporter les méthodes qui seront attribuées aux différentes routes -----//

// Import du modèle de sauce
const modelSauce = require("../models/sauces");

// Import du package fs (nous donne accès aux fonctions permettant de modifier le système de fichiers)
const fs = require("fs");

// Création et export de la fonction pour gérer la route GET pour récupérer la liste de sauces
exports.getAllSauces = (req, res, next) => {
  modelSauce
    // Utilisation de la méthode "find()" dans le modèle Mongoose pour trouver les sauces dans la base de données
    .find()
    // Une promise est retournée
    // Récupération des sauces sous forme de tableau
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Création et export de la fonction pour gérer la route POST pour enregistrer des sauces dans la base de données
exports.createSauce = (req, res, next) => {
  // On stocke les données envoyées par le front-end sous forme de form-data dans une variable en les transformant en objet js
  const sauceObject = JSON.parse(req.body.sauce);
  // On supprime l'id généré automatiquement et envoyé par le front-end. L'id de la sauce est créé par la base MongoDB lors de la création dans la base
  delete sauceObject._id;
  // Suppression de l'userId de la requête envoyée par l'utilisateur, pour le remplacer en base de données par le userId extrait du token par le middleware d'authentification
  delete sauceObject._userId;
  // Création d'une instance du modèle "Sauce" en lui passant comme objet toutes les informations requises du corps de requête analysé
  const sauce = new modelSauce({
    // Récupération des éléments dans le corps de la requête
    ...sauceObject,
    // Remplacement de l'userId de la requête par l'userId extrait du token par le middleware "authorize"
    userId: req.authorize.userId,
    //-- Création de l'URL de l'image --//
    // req.protocol : pour obtenir le premier segment "http"
    // + "://"
    // req.get("host") : pour résoudre l'hôte du serveur "localhost:3000"
    // + "/images/"
    // req.file.filename : pour le nom de fichier
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    // On initialise les likes et dislikes de la sauce à 0
    likes: 0,
    dislikes: 0,
    // On initialise les usersLiked et usersDisliked avec des tableaux vides
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    // On enregistre la nouvelle sauce dans la base de données
    .save()
    // "save" renvoie une promise
    // Renvoie d'une réponse de réussite avec un code 201
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    // Renvoie d'une réponse avec l'erreur generée par Mongoose ainsi que le code 400
    .catch((error) => res.status(400).json({ error }));
};

// Création et export de la fonction pour gérer la route GET pour récupérer une sauce
// Utilisation de ":" en face du segment dynamique pour la rendre accessible en tant que paramètre
exports.getOneSauce = (req, res, next) => {
  modelSauce
    // Utilisation de la méthode "findOne()" dans le modèle Mongoose pour trouver la sauce correspondant à l'id du paramètre de la requête passé dans l'objet de comparaison
    .findOne({ _id: req.params.id })
    // Une promise est retournée
    // Récupération de la sauce
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Création et export de la fonction pour gérer la route PUT pour modifier une sauce existante
// Utilisation de ":" en face du segment dynamique pour la rendre accessible en tant que paramètre
exports.modifySauce = (req, res, next) => {
  let sauceObject = {};
  req.file
    ? // On regarde si un champs "file" (image) existe ou non
      (modelSauce
        .findOne({
          _id: req.params.id,
        })
        .then((sauce) => {
          // Si une image existe, on supprime l'ancienne image
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlinkSync(`images/${filename}`);
        }),
      (sauceObject = {
        // On modifie les données et on ajoute la nouvelle image
        ...JSON.parse(req.body.sauce),
        // On recrée l'URL de l'image
        // req.protocol : pour obtenir le premier segment "http"
        // + "://"
        // req.get("host") : pour résoudre l'hôte du serveur "localhost:3000"
        // + "/images/"
        // req.file.filename : pour le nom de fichier
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      })) // Si non, récupération de l'objet directement dans le corps de la requête
    : { ...req.body };
  // Utilisation de la méthode "updateOne()" de Mongoose pour modifier la sauce
  modelSauce
    .updateOne(
      // 1er argument : objet de comparaison
      { _id: req.params.id },
      // 2e argument : sauce modifiée en récupérant la sauce dans le corps de la requête avec l'id correspondant
      { ...sauceObject, _id: req.params.id }
    )
    // Une promise est retournée
    // Envoie d'un message
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Création et export de la fonction pour gérer la route DELETE pour supprimer une sauce
// Utilisation de ":" en face du segment dynamique pour la rendre accessible en tant que paramètre
exports.deleteSauce = (req, res, next) => {
  // Utilisation de la méthode "findOne" de Mongoose pour récupérer la sauce dans la base de données
  modelSauce
    .findOne(
      // Argument: On récupère l'id de la sauce
      { _id: req.params.id }
    )
    // On vérifie si l'utilisateur est le bon
    .then((sauce) => {
      // Si l'userId récupéré dans la base de données est différent de l'userId venant du token
      if (sauce.userId != req.authorize.userId) {
        res.status(401).json({ message: "Non autorisé !" });
      } else {
        //-- Suppression de l'image du fichier --//
        // Récupération du nom de fichier grâce au split
        const filename = sauce.imageUrl.split("/images/")[1];
        // Suppression de l'image avec la péthode "unlik" de fs en entrant le chemin vers le fichier
        fs.unlink(`images/${filename}`, () => {
          modelSauce
            // Utilisation de la méthode "deleteOne()" de Mongoose pour supprimer la sauce correspondant à l'id du paramètre de la requête passé dans l'objet de comparaison
            .deleteOne(
              // Argument: On récupère l'id de la sauce
              { _id: req.params.id }
            )
            // Une promise est retournée
            // Envoie d'un message
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Création et export de la fonction permettant de liker ou disliker une sauce
exports.likeDislike = (req, res, next) => {
  // Si l'utilisateur clique sur le bouton like
  if (req.body.like === 1) {
    modelSauce
      // Utilisation de la méthode "updateOne" de Mongoose pour mettre à jour les likes et dislikes
      .updateOne(
        // 1er argument : On détermine par son id la sauce qu'on veut modifier
        {
          _id: req.params.id,
        },
        // 2e argument: On push l'utilisateur et on incrémente le like de 1
        {
          $push: { usersLiked: req.body.userId },
          $inc: { likes: req.body.like },
        }
      )
      // Promise retournée
      // Envoie d'un message
      .then(() => res.status(200).json({ message: "Sauce likée !" }))
      .catch((error) => res.status(400).json({ error }));
  }
  // Si l'utilisateur clique sur le bouton dislike
  if (req.body.like === -1) {
    modelSauce
      // Utilisation de la méthode "updateOne" de Mongoose pour mettre à jour les likes et dislikes
      .updateOne(
        // 1er argument: On récupère l'id de la sauce
        {
          _id: req.params.id,
        },
        // 2e argument: On push l'utlisateur et on incrémente le dislike de 1
        {
          $push: { usersDisliked: req.body.userId },
          $inc: { dislikes: 1 },
        }
      )
      // Promise retournée
      // Envoie d'un message
      .then(() => res.status(200).json({ message: "Sauce dislikée !" }))
      .catch((error) => res.status(400).json({ error }));
  }
  // Si on veut annuler un like ou un dislike
  if (req.body.like === 0) {
    modelSauce
      // Utilisation de la méthode "findOne" de Mongoose pour récupérer la sauce dans la base de données
      .findOne(
        // Argument: On récupère l'id de la sauce
        {
          _id: req.params.id,
        }
      )
      .then((sauce) => {
        // Si l'userId correspond à l'utilisateur ayant liké
        if (sauce.usersLiked.includes(req.body.userId)) {
          modelSauce
            // Utilisation de la méthode "updateOne" de Mongoose pour mettre à jour les likes et dislikes
            .updateOne(
              // 1er argument: On récupère l'id de la sauce
              { _id: req.params.id },
              // 2e argument: On supprime l'utlisateur et on décrémente le like de 1
              {
                $pull: { usersLiked: req.body.userId },
                $inc: { likes: -1 },
              }
            )
            // Promise retournée
            // Envoie d'un message
            .then((sauce) => {
              res.status(200).json({ message: "Like supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
          // Si l'userId correspond à l'utilisateur ayant disliké
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          modelSauce
            .updateOne(
              // 1er argument: On récupère l'id de la sauce
              { _id: req.params.id },
              // 2e argument: On push l'utlisateur et on décrémente le dislike de 1
              {
                $pull: { usersDisliked: req.body.userId },
                $inc: { dislikes: -1 },
              }
            )
            // Promise retournée
            // Envoie d'un message
            .then((sauce) => {
              res.status(200).json({ message: "Dislike supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        }
      });
  }
};
