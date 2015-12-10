// Contrôleur principal
// ====================

'use strict';

var View = require('./view');
var userName = require('lib/notifications').userName;
var moment = require('moment');
var CheckInView = require('./check_in_view');
var HistoryView = require('./history_view');
var connectivity = require('lib/connectivity');

module.exports = View.extend({
  // Le template principal
  template: require('./templates/home'),
  subscriptions: {
    'connectivity:online' : 'syncMarker',
    'connectivity:offline': 'syncMarker',
  },

  syncMarker: function syncMarker() {
    // Simple way to improve perfs, do the below!
    this.$marker = this.$marker ||this.$('#onlineMarker');
    this.$('#onlineMarker')[
      connectivity.isOnline() ? 'show' : 'hide'
    ]('slow');
  },

  // This data will be given to jade!
  getRenderData: function() {
    return {
      userName: userName,
      now: moment().format('dddd D MMMM YYYY HH:mm:ss'),
    };
  },

  afterRender: function afterHomeRender() {
    this.startClock();
    this.syncMarker();
    new CheckInView({
      el: this.$('#checkInUI'),
    }).render();
    new HistoryView({
      el: this.$('#historyUI'),
    }).render();
  },

  // Remember, we lose the context of (this) so either
  // stock the variable in a temp, or bind it!
  // NAME YOUR FUCKING FUNCTIONS!
  startClock: function startClock() {
    // var local = this;
    var clock = this.$('#ticker');
    // setInterval( function() {
    // 	clock.text( local.getRenderData().now );
    // }, 1000);
    // BETTER
    setInterval(function updateClock() {
      clock.text(this.getRenderData().now);
    }.bind(this), 1000);
  },
});