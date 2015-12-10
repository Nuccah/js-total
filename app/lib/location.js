// Interface géolocalisation
// =========================

'use strict';

// Encapsulation du service de géolocalisation.  Va envoyer
// un message si le client ne prend pas en charge l'API de
// géolocalisation W3C.

var _ = require('underscore');
var cnxSvc = require('lib/connectivity');

// Si cette API n'est pas exploitable pour une raison quelconque
// (ex. connexion à un DSLAM mal équipé/configuré, genre au fin
// fond de la Creuse…), on peut travailler avec cette appli en
// plaçant cette variable `$FAKE` à `true`, ce qui renverra
// "en dur" les coordonnées du siège de Delicious Insights ;-)
var $FAKE = false;

// Persistence localStorage de la dernière géoloc utilisée.
var latestGeoloc = localStorage.latestGeoloc || null;
if (latestGeoloc) {
  latestGeoloc = _.map(latestGeoloc.split(','), Number);
}

// Voici la méthode-clé de vérification de la géolocalisation.
// C'est la seule méthode exposée par le module.  L'API W3C tente
// en général d'exploiter une précision maximale (par exemple en
// interpolant les données issues de points d'accès Wi-Fi proches).
// Le callback est appelé soit avec une latitude et une longitude
// (en cas de succès) soit avec un message d'erreur.
//
// Performance : la géoloc navigateur par des moyens non-GPS
// (ex. interpolation Wi-Fi, requêtage DSLAM…) peut prendre pas
// mal de temps (4-6s pendant mes tests).
function getCurrentLocation(callback) {
  if (!_.isFunction(callback))
    throw 'Missing or invalid callback';
  if (!(navigator.geolocation) || !cnxSvc.isOnline() || $FAKE) {
    var geoloc = latestGeoloc || [48.88268482, 2.32229512];
    callback.apply(null, geoloc);
  } else {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude, lng = position.coords.longitude;
      latestGeoloc = [lat, lng];
      localStorage.latestGeoloc = latestGeoloc.join(',');
      callback(lat, lng);
    }, function(msg) {
      if (!_.isString(msg)) msg = 'Geolocation failure';
      callback(msg);
    });
  }
}

exports.getCurrentLocation = getCurrentLocation;
