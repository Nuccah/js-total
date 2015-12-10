// Modèle : CheckIn
// ================

// 'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
var connectivity = require('lib/connectivity');

module.exports = Backbone.Model.extend({
	defaults: {
		lat: 0,
		lng: 0,
		places: [],
		placeId: null,
		comment: '',
		fetchPlacesForbidden: false,
		checkInForbidden: true,
	},

	initialize: function initialize() {
		this.on('change', checkCheckinAble);
		// this.on('change', checkFetchable.bind(this));
		var that = this;
		Backbone.Mediator.subscribe('connectivity:online', checkFetchable);
		Backbone.Mediator.subscribe('connectivity:offline', checkFetchable);

		function checkCheckinAble() {
			that.set('checkInForbidden', (that.get('placeId') === null));
		}

		function checkFetchable() {
			that.set('fetchPlacesForbidden', !connectivity.isOnline());
		}
		checkCheckinAble();
		checkFetchable();
	},

	getPlace: function getPlace() {
		return _.findWhere(
			this.get('places'), {
				id: this.get('placeId')
			}
		);
	},
});