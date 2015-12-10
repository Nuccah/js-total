// Interface POI
// =============

'use strict';

// Encapsulation de la bibliothèque Places au sein de la Google Maps v3 JS API.
// La formation ne s'occupe pas des détails de ce module, qui est annexe au
// sujet.

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Lawnchair = require('lawnchair');
var cnxSvc = require('lib/connectivity');

/* global google */

// Clé API dédiée à l'atelier.  Permet 1K req/jour, pensez à enregistrer
// votre propre appli et clé sur http://code.google.com/apis/console
var JSGURUV3_API_KEY = 'AIzaSyCoiEjsdXfD5roowpX5jN3cwImV1TgGzIs';

// On s'intéresse uniquement à certains types de POI.
var POI_TYPES = ['bakery', 'bar', 'cafe', 'food', 'meal_takeaway', 'restaurant'];

// On filtre les résultats sur un certain rayon (en mètres) autour des géocoords
// initiales.
var RADIUS = 1500;

// On limite aussi le resultset à un certain nombre de POI, sinon ça devient
// vite le souk à scanner.
var MAX_PLACES = 12;

// On fait attention à la connectivité pour éviter les appels en offline
// et rafraîchir automatiquement en cas d'online à nouveau.
var placesService, distanceService;
require('lawnchair-dom');
var localStore = new Lawnchair({ name: 'pois' }, $.noop);


// Si cette API n'est pas exploitable pour une raison quelconque
// (ex. on est offline), on peut travailler avec cette appli en
// plaçant cette variable `$FAKE` à `true`, ce qui renverra
// "en dur" des POI autour du siège de Delicious Insights ;-)
var $FAKE = true;

// Fonction interne d'initialisation de l'API par chargement
// asynchrone de la lib depuis chez Google et exploitation d'un
// callback.
function initializePlacesAPI() {
  if (placesService || !cnxSvc.isOnline()) return;
  var script = document.createElement('script');
  script.src = 'http://maps.googleapis.com/maps/api/js?key=' + JSGURUV3_API_KEY +
    '&libraries=places&sensor=true&callback=makePlacesReady';

  window.makePlacesReady = function() {
    delete window.makePlacesReady;
    var div = document.createElement('div');
    placesService = new google.maps.places.PlacesService(div);
    distanceService = new google.maps.DistanceMatrixService();
  };

  $('script:first').after(script);
}

// Recherche des POI pertinents près d'une position donnée.  La position peut
// $etre donnée soit en deux arguments (latitude et longitue) soit en tant que
// `google.maps.LatLng`, donc un seul argument.  Dans les deux cas, l'argument
// final *doit* être une fonction de rappel, qui sera appelée avec un tableau de
// hashes représentant les POI.
//
// Performance : durant les tests, c'est assez rapide--pas plus d’1s.
function lookupPlaces(lat, lng, callback) {
  var dontLookup = !cnxSvc.isOnline() || $FAKE;
  if (!placesService && !dontLookup) {
    console.log('Place search service isn’t ready yet! Deferring 1s…');
    _.delay(lookupPlaces, 1000, lat, lng, callback);
    return;
  }

  // On joue offline ? Pas grave, on renvoie des trucs de test histoire de…
  if (dontLookup) {
    localStore.all(function(savedPOIs) {
      if (savedPOIs && savedPOIs.length) {
        callback(savedPOIs);
        return;
      }

      callback([
        { id: '42', name: 'Le Mont Liban', vicinity: '42 Boulevard Batignolles', distance: 65, duration: 49, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '43', name: 'La Raymondine', vicinity: '42 Boulevard Batignolles', distance: 65, duration: 49, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '44', name: 'Batignolles Express', vicinity: '32 Rue Batignolles', distance: 80, duration: 60, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '45', name: 'Les Batignolles', vicinity: '31 Boulevard Batignolles', distance: 99, duration: 68, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '46', name: 'AGD', vicinity: '36 Boulevard Batignolles', distance: 99, duration: 68, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '47', name: 'Le Paris Rome', vicinity: '60 Boulevard Batignolles', distance: 103, duration: 88, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '48', name: 'Picard Surgelés', vicinity: '37 Avenue Clichy', distance: 108, duration: 92, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '49', name: 'La Boutique de Camille', vicinity: '33 Boulevard Batignolles', distance: 126, duration: 115, key: Date.now() - _.random(0, 60) * 60000 },
        { id: '50', name: 'Fédération de la Boucherie', vicinity: '23 Rue Clapeyron', distance: 127, duration: 116, key: Date.now() - _.random(0, 60) * 60000 }
      ]);
    });
    return;
  }

  // Traitements de la signature variable pour l'appel à cette fonction.
  callback = arguments[arguments.length - 1];
  if (!_.isFunction(callback))
    throw 'Missing or invalid callback';
  var latLng;
  if (lat instanceof google.maps.LatLng)
    latLng = lat;
  else if (_.isUndefined(lng))
    throw 'Invalid call: requires either a LatLng or a latitude plus a longitude';
  else
    latLng = new google.maps.LatLng(lat, lng);

  // Lancement de la recherche
  placesService.search({
    location: latLng,
    rankBy:   google.maps.places.RankBy.DISTANCE,
    types:    POI_TYPES
  }, function(result, status) {
    if (google.maps.places.PlacesServiceStatus.OK !== status) {
      callback([]);
      return;
    }

    // Bon, maintenant on chope la distance pour chaque point (car Google Places
    // n'a pas eu la bonne idée de le filer, tsk tsk).  Heureusement, l'API concernée
    // est super rapide (sans doute vu qu'elle n'a aucune I/O à faire côté Google).
    var dests = $.map(result, function(p) { return p.geometry.location; });
    distanceService.getDistanceMatrix({
      origins: [latLng],
      destinations: dests,
      travelMode: google.maps.TravelMode.WALKING
    }, function(distances) {
      for (var index = 0, l = result.length; index < l; ++index) {
        var item = result[index], dist = distances.rows[0].elements[index];
        result[index] = {
          id:       item.id,
          icon:     item.icon,
          name:     item.name,
          vicinity: item.vicinity,
          distance: dist.distance ? dist.distance.value : 0,
          duration: dist.duration ? dist.duration.value : 0
        };
      }
      result = _.filter(result, function(r) { return r.distance <= RADIUS; });
      result = _.sortBy(result, function(r) { return r.distance; }).slice(0, MAX_PLACES);
      _.each(result, function(r) { r.key = r.id; });
      localStore.nuke(function() {
        localStore.batch(result);
      });
      callback(result);
    });
  });
}

initializePlacesAPI();
Backbone.Mediator.subscribe('connectivity:online', initializePlacesAPI);

module.exports = {
  lookupPlaces: lookupPlaces,
  poiTypes: POI_TYPES
};
