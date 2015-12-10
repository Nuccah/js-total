# Mini-serveur applicatif pour l'appli
# ====================================

bodyParser   = require('body-parser')
errorHandler = require('errorhandler')
express      = require('express')
fs           = require('fs')
http         = require('http')
logger       = require('morgan')
socketio     = require('socket.io')
low          = require('lowdb')

# Chargement de la « base »
# -------------------------
#
# Tentative de chargement d'un `db.json` existant
# (aucun problème s'il n'est pas là, mais permet
# de persister les check-ins au travers des lancements
# du serveur de dev)

try
  low.load('db.json')
catch
  console.error "Cannot load db.json (but that's alright!)"
DB = low('checkins').sortBy('key').value().reverse()

# Serveur de dev Brunch
# ---------------------

# Quand on spécifie un fichier de serveur de dev
# à Brunch, il attend un module CommonJS qui exporte
# une fonction `startServer`.  Depuis la 1.7.10 environ,
# celle-ci reçoit en 3ème argument un *callback* qu'il est
# impératif d'appeler quand on est prêt, sinon le *watcher*
# ne se déclenche jamais.
exports.startServer = (port, path, brunchReady) ->
  app = express()
  server = http.createServer(app)
  io = socketio(server)

  # Les middlewares : fichiers statiques, logs, analyse
  # des corps de requêtes JSON.

  app.use express.static "#{__dirname}/public"
  app.use errorHandler()
  app.use logger(':method :url')
  app.use bodyParser.json()

  # API Ajax
  # --------

  api = new express.Router()
  app.use '/api/v1/checkins', api

  # GET racine -> liste des 10 plus récents check-ins
  api.get '/', (request, response) ->
    response.json DB[0...10]

  # POST racine -> création de check-in.
  api.post '/', (request, response) ->
    checkIn = request.body
    checkIn.id = DB.length + 1
    DB.unshift checkIn
    # On persiste sur disque dans le `db.json`
    low('checkins').insert(checkIn);
    # On renvoie une 201 (*Created*) avec un corps de réponse
    # contenant le delta (ici l'ID), que la couche client fusionnera
    # avec son modèle existant.
    response.status(201).json { id: checkIn.id }
    # On notifie tout le monde du nouveau check-in, par *broadcast* websockets.
    io.emit 'checkin', checkIn

  # GET entité -> obtention des données d'un check-in précis.
  # Utilisé par la route secondaire si l'URL référence un check-in
  # trop ancien pour figurer d'entrée de jeu dans la collection côté
  # client.
  api.get '/:id', (request, response) ->
    id = +request.params.id
    result = (ci for ci in DB when ci.id is id)
    if result[0]
      response.json result[0]
    else
      response.status(404).json {}

  # Toute URL hors API : on sert l'appli cliente.
  # Ainsi on prend en charge les URLs profondes en mode
  # *pushState* si besoin.

  app.get '*', (request, response) ->
    response.sendfile 'public/index.html'


  # Lancement du serveur
  # --------------------
  server.listen port, ->
    console.log "Listening on port #{port}… WebSockets enabled."
    # Ne pas oublier d'appeler le callback de complétion pour que
    # Brunch démarre le watcher !
    brunchReady()
