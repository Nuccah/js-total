// Classe de contrôleur étendu
// ===========================

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var helpers = require('lib/view_helper');

// Si chargé depuis les tests…
// …assurer les plugins BS3
require('bootstrap');
// …assurer le data-binding
require('backbone-stickit');

// Classe de base pour toutes les vues.  Presque pile
// celle de brunch.io (on a juste ajouté le _.defer pour
// régler automatiquement toute une catégorie de bugs,
// et initialisé la langue de Moment.js).
module.exports = Backbone.View.extend({

  initialize: function() {
    _.bindAll(this, 'template', 'getRenderData', 'render', 'afterRender');
  },

  template: function() {},

  getRenderData: function() {
    return this.model && this.model.toJSON ? this.model.toJSON() : this.model;
  },

  render: function() {
    this.$el.html(this.renderTemplate(this.getRenderData()));
    if (this.model) {
      this.stickit();
    }
    _.defer(this.afterRender);
    return this;
  },

  renderTemplate: function renderTemplate(obj, tmpl) {
    tmpl = tmpl || this.template;
    var presenter = $.extend({}, helpers, obj);

    return tmpl(presenter);
  },

  afterRender: function() {}
});