// Lib : Persistence
// =================

'use strict';

var CheckInsCollection = require('models/collection');
var collection = new CheckInsCollection();
var Backbone = require('backbone');
var connectivity = require('lib/connectivity');

function addCheckIn(checkIn) {
	checkIn.key = checkIn.key || Date.now();
	collection[('id' in checkIn) ? 'add' : 'create'](checkIn);
}

function getCheckIns() {
	return collection.toJSON();
}

function syncPending() {
	if (!connectivity.isOnline()) return;
	collection.fetch({
		reset: true
	});
}

syncPending();

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