// Routeur
// =======

'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var application = require('application');
var CheckInDetailsView = require('views/check_in_details_view');
var store = require('lib/persistence');
module.exports = Backbone.Router.extend({
  // Déclaration
  // -----------
  routes: {
    // La route racine, pour la page principale
    '': 'home',
    'check-in/:id' : 'showCheckIn',
  },

  // Gestionnaires
  // -------------

  // Route racine : affichage principal.
  home: function() {
    // Vu que cet affichage persiste en arrière-plan, c'est un peu spécial : on ne le fait qu'une fois
    if (this.homeRendered) {
      return;
    }

    $('body').html(application.homeView.render().el);
    this.homeRendered = true;
  },

  showCheckIn: function showCheckIn(id) {
    this.home(true);
    CheckInDetailsView.display(store.getCheckIn(id));
  },


});
