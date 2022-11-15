//----- Démarrage d'un serveur Node (environnement d'éxécution qui permet d'écrire toutes nos tâches côté serveur, en JavaScript, telles que la logique métier, la persistance des données et la sécurité. Node ajoute également des fonctionnalités que le JavaScript du navigateur standard ne possède pas, comme par exemple l'accès au système de fichiers local) -----//

// Import du package HTTP de Node pour la création du serveur
const http = require("http");

// Import de l'application
const app = require("./app");

// Renvoie d'un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaine
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(process.env.PORT || 3000);

// On dicte à l'application sur quel port elle doit tourner
app.set("port", port);

// Recherche, gestion et enregistrement des différentes erreurs.
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === "string" ? "pipe" + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Fonction qui sera éxécuté à chaque appel vers le serveur
const server = http.createServer(app);

// Ecouteur d'évènements consignant le port ou le canal nommé sur lequel le serveur s'éxécute dans la console
server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe" + address : "port" + port;
  console.log("Listening on " + bind);
});

// Configuration du serveur pour qu'il écoute soit la variable d'environnement du port, soit le port 3000
server.listen(port);
