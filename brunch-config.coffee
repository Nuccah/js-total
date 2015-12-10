# Configuration Brunch
# ====================

# Brunch attend un module CommonJS qui exporte une propriété `config`.
#
# Voyez https://github.com/brunch/brunch/blob/stable/docs/config.md
# pour une documentation exhaustive des options possibles.
exports.config =

  # Concaténations
  # --------------
  #
  # On a ici seulement deux fichiers cibles :
  #
  #   * `app.js` pour le JS (d'origine + précompilations des *templates*)
  #   * `app.css` pour les CSS (le LESS de Bootstrap, le Stylus de l'appli…)
  files:
    javascripts:
      joinTo: 'app.js'
    stylesheets:
      joinTo: 'app.css'
    templates:
      joinTo: 'app.js'

  # Nomenclature des modules
  # ------------------------
  #
  # La nomenclature normale de Brunch marcherait bien si nous n'avions pas
  # choisi de placer nos libs "externes" (jQuery, etc.) dans `app/externals`
  # et, surtout, avec des noms détaillés (versionnés, avec la langue, etc.).
  #
  # Du coup, pour autoriser par exemple `require('jquery')`, qui n'aura pas
  # à évoluer quand on changera la version de la lib, au lieu du moins pérenne
  # `require('externals/jquery-1.10.2')`, on prend la main sur la transformation
  # des chemins en noms.
  modules:
    nameCleaner: (path) ->
      path
        # On vire les préfixes `app/` (classique) et `app/externals/`
        .replace /^app\/(?:externals\/)?/, ''
        # On retire les suffixes `-x.y[.z…]` des mantisses
        .replace /-\d+(?:\.\d+)+/, ''
        # On retire les suffixes de langue `-fr` des mantisses
        .replace '-fr.', '.'

  # Plugins
  # -------
  #
  # La majorité des plugins Brunch n'ont pas besoin de configuration pour
  # être opérationnels : leur simple présence dans `node_modules` suffit.
  # Toutefois, il peut arriver qu'on ait besoin d'en personnaliser le
  # comportement.  C'est ce qui se passe ici, où on ajoute certaines URLs
  # externes au manifeste de cache applicatif maintenu par `appcache-brunch`.
  plugins:
    appcache:
      externalCacheEntries: [
        'http://maps.gstatic.com/mapfiles/place_api/icons/bar-71.png'
        'http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png'
        'http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png'
        'http://maps.gstatic.com/mapfiles/place_api/icons/wine-71.png'
      ]
      network: ['*', 'http://*', 'https://*']

  # Serveur de dev
  # --------------
  #
  # On fournit notre propre serveur de dev à la place de celui intégré dans
  # Brunch, car on ne se contente pas de servir des fichiers statiques :
  # on fournit aussi une mini-API Ajax et un point d'accès WebSockets.
  server:
    path: 'jst-server.coffee'

  # Watcher
  # -------
  #
  # Brunch a deux modes de surveillance des fichiers : le classique, et le
  # *polling*.  Le second est un poil moins réactif, mais a moins de problèmes
  # que le premier, quel que soit l'OS.  On le préfère donc dans cette démo.
  watcher:
    usePolling: true
