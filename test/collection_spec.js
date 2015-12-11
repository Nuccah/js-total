'use strict';
/* global describe, before, it, beforeEach, after, afterEach */
var chai = require('chai');
describe('The collection', function() {
	before(function() {
		chai.should();
	}); // Avant l'ensemble du `describe`
	var collection;
	beforeEach(function() {
		console.log('beforeEach');
		var Collection = require('models/collection');
		collection = new Collection();
	}); // Avant chaque `it`

	after(function() {
		console.log('after');
	});

	afterEach(function() {
		console.log('afterEach');
	});

	it('should maintain the natural order', function() {
		var oldCheckIn = {
			key: Date.now() - 1000
		};

		var newCheckIn = {
			key: Date.now()
		};

		collection.add(oldCheckIn);
		collection.add(newCheckIn);

		collection.at(0).toJSON().should.deep.equal(newCheckIn);
		collection.at(1).toJSON().should.deep.equal(oldCheckIn);
		// What if its not clear enough?
		// collection.at(0).toJSON().should.deep.equal(newCheckIn, 'le premier checkin de la collection devrait etre le plus recente');
	});
});