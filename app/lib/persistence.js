// Lib : Persistence
// =================

'use strict';

var CheckInsCollection = require('models/collection');
var collection = new CheckInsCollection();
var Backbone = require('backbone');
var connectivity = require('lib/connectivity');
var _ = require('underscore');

function addCheckIn(checkIn) {
	checkIn.key = checkIn.key || Date.now();
	collection[('id' in checkIn) ? 'add' : 'create'](checkIn);
}

function getCheckIns() {
	return collection.toJSON();
}

var pendings = [];

function accountForSync(model) {
	pendings = _.without(pendings, model);
	if (pendings.length) return;
	collection.off('sync', accountForSync);
	collection.fetch({
		reset: true
	});
}

function syncPending() {
	if (!connectivity.isOnline()) return;
	collection.off('sync', accountForSync);
	pendings = collection.filter(function(c) {
		return c.isNew();
	});
	if (pendings.length) {
		collection.on('sync', accountForSync);
		_.invoke(pendings, 'save');
	} else
		collection.fetch({
			reset: true
		});
}

syncPending();

Backbone.Mediator.subscribe(
	'connectivity:online', syncPending
);

collection.on('reset', function() {
	Backbone.Mediator.publish('checkins:reset');
});

collection.on('add', function(model) {
	Backbone.Mediator.publish('checkins:new', model.toJSON());
});

module.exports = {
	addCheckIn: addCheckIn,
	getCheckIns: getCheckIns,
	syncPending: syncPending,
};