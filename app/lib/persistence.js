// Lib : Persistence
// =================

'use strict';

var CheckInsCollection = require('models/collection');
var collection = new CheckInsCollection();
var Backbone = require('backbone');
var connectivity = require('lib/connectivity');
var _ = require('underscore');
var LawnChair = require('lawnchair');
require('lawnchair-dom');
var localStore = new LawnChair({
	name: 'checkins'
}, function() {});

function addCheckIn(checkIn) {
	console.log(checkIn);
	// if (collection.findWhere(_.pick(checkIn, 'key', 'userName'))) {
	// 	return;
	// }

	checkIn.key = checkIn.key || Date.now();
	collection['id' in checkIn ? 'add' : 'create'](checkIn);
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

function initialLoad() {
	localStore.all(function lsAll(checkins) {
		collection.reset(checkins);
		syncPending();
	});
}

initialLoad();

Backbone.Mediator.subscribe(
	'connectivity:online', syncPending
);

collection.on('reset', function() {
	localStore.nuke(function() {
		localStore.batch(collection.toJSON());
	});
	Backbone.Mediator.publish('checkins:reset');
});

collection.on('add', function(model) {
	localStore.save(model.toJSON());
	Backbone.Mediator.publish('checkins:new', model.toJSON());
});

collection.on('sync', function(model) {
	if (!(model instanceof collection.model)) {
		return;
	}

	localStore.save(model.toJSON());
	Backbone.Mediator.publish('checkins:saved', model);
});

function getCheckIn(id, cb) {
	var checkIn = collection.get(id);
	// Why defer? To guarantee both cases are treated equally
	// if (checkIn) return _.defer(cb, null, checkIn.toJSON());
	if (checkIn) return cb(null, checkIn);

	checkIn = new collection.model({
		id: id
	});
	checkIn.urlRoot = collection.url;
	checkIn.fetch({
		success: setupCheckIn,
		error: reportError
	});

	function setupCheckIn() {
		collection.add(checkIn);
		cb(null, checkIn.toJSON());
	}

	function reportError() {
		cb(0xDEAD);
	}
}

module.exports = {
	addCheckIn: addCheckIn,
	getCheckIns: getCheckIns,
	getCheckIn: getCheckIn,
};