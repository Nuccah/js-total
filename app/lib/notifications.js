// Notifications
// =============

'use strict' ;

var $ = require('jquery');
var userName = sessionStorage.userName || $.trim(prompt('What is your name?!'));
var _ = require('underscore');

if (userName) {
	sessionStorage.userName = userName;
} else {
	userName = 'Pirate'+ _.random(1000, 10000);
}

exports.userName = userName;