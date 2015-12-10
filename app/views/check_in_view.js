// Check In View
// =============

'use strict';

var View = require('./view');
var locSvc = require('lib/location');
var poiSvc = require('lib/places');
var _ = require('underscore');
var CheckInUX = require('models/check_in_ux');
var userName = require('lib/notifications').userName;
var store = require('lib/persistence');
module.exports = View.extend({
	// Le template principal
	template: require('./templates/check_in'),
	placesTemplate: require('./templates/places'),
	bindings: {
		'#comment': 'comment',
		'#geoloc': {
			observe: ['lat', 'lng'],
			onGet: function(pos) {
				if (_.isString(pos[0]) || pos[0] === 0)
					return 'Je suis...';
				return pos[0].toFixed(6) + ' ' + pos[1].toFixed(6);
			}
		},
		'#places': {
			observe: ['places', 'placeId'],
			onGet: function() {
				return this.getRenderData().placeList;
			},
			updateMethod: 'html'
		},
		'button[type=submit]': {
			attributes: [{
				name: 'disabled',
				observe: 'checkInForbidden',
			}]
		},
		'header button': {
			attributes: [{
				name: 'disabled',
				observe: 'fetchPlacesForbidden',
			}]
		}
	},
	events: {
		'click .btn-info': 'fetchPlaces', // = $(this.el).on('click', '.btn-info', this.fetchPlaces.bind(this));
		'click #places li': 'selectPlace',
		'submit': 'checkIn',
	},

  subscriptions: {
    'connectivity:online' : 'fetchPlaces',
  },

	initialize: function() {
		View.prototype.initialize.apply(this, arguments);
		this.model = new CheckInUX();
	},

	checkIn: function checkIn(e) {
		e.preventDefault();
		if (this.model.get('checkInForbidden')) {
			return;
		}
		var place = this.model.getPlace();
		var checkIn = {
			placeId: place.id,
			vicinity: place.vicinity,
			icon: place.icon,
			name: place.name,
			comment: this.model.get('comment'),
			userName: userName,
		};
		store.addCheckIn(checkIn);
		this.model.set({
			placeId: this.model.defaults.placeId,
			comment: this.model.defaults.comment,
		});
	},

	selectPlace: function selectPlace(e) {
		// this     -> view, can't use
		// e.target -> too specific
		var placeId = e.currentTarget.getAttribute('data-place-id');
		this.model.set('placeId', placeId);
	},

	// This data will be given to jade!
	getRenderData: function getRenderData() {
		return {
			placeList: this.renderTemplate({
					places: this.model.get('places'),
					placeId: this.model.get('placeId'),
				},
				this.placesTemplate
			)
		};
	},

	afterRender: function afterHomeRender() {
		this.fetchPlaces();
	},

	fetchPlaces: function fetchPlaces() {
		var that = this;
		this.model.set(this.model.defaults);
		locSvc.getCurrentLocation(function(lat, lng) {
			// console.log(lat, long);
			if (_.isString(lat)) {
				return;
			}
			that.model.set({
				lat: lat,
				lng: lng
			});
			poiSvc.lookupPlaces(lat, lng, function(places) {
				that.model.set('places', places);
			});
		});
	},
});