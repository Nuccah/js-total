'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var View = require('./view');

var CheckInDetailsView = View.extend({
  className: 'modal fade',
  id: 'checkInDetails',
  // événement bootstrap
  events: {
    'hidden.bs.modal': 'wrapUp'
  },
  template: require('./templates/check_in_details'),
  wrapUp: function wrapUp() {
    if (!cancelling) {
      Backbone.history.navigate('');
    }
    cancelling = false;
  }
});

var singleton = new CheckInDetailsView(),
  cancelling = false;

function cancelCheckInDetails() {
  cancelling = true;
  singleton.$el.modal('hide');
  Backbone.history.navigate('', {
    replace: true
  });
}

function displayCheckInDetails(model) {
  // console.log(model); return;
  singleton.model = model;
  singleton.render();
  // singleton.el est un pointeur DOM : meme si on l'init
  $('body').append(singleton.el);
  singleton.$el.modal('show');
}

module.exports = {
  cancel: cancelCheckInDetails,
  display: displayCheckInDetails
};