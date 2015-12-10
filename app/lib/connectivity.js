// Détection online/offline
// ========================

'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
// Ce module encapsule la gestion de la connectivité
// (états online/offline du navigateur) à destination des
// divers éléments externes (notamment la couche de persistence
// et les exploitations d'API externes type Google Maps / Places).

// On publie une seule méthode : isOnline.  Indique le bon état en
// live sur à peu près tous les browsers modernes.
exports.isOnline = function() {
	return true;
};

if (undefined !== typeof navigator && 'onLine' in navigator) {
	exports.isOnline = function() {
		return navigator.onLine;
	};

	$(window).on('online offline', checkStatus);
	checkStatus();
}

function checkStatus() {
	Backbone.Mediator.publish(
		exports.isOnline() ? 'connectivity:online' : 'connectivity:offline'
	);
}