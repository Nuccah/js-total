// Ce module est un emplacement dédié pour tous nos helpers Jade.

var moment = require('moment');

module.exports = {
  // Petit helper formattant un check-in pour obtenir son moment
  // de création formatté en HH:mm.
  checkInMoment: function checkInMoment(checkIn) {
    var key = checkIn.hasOwnProperty('key') ? checkIn.key : checkIn;
    return moment(+key).format('HH:mm');
  },

  // Petit helper formattant un nombre de secondes avec un niveau
  // d'arrondi plus parlant (tel quel sous la minute, en minutes sinon).
  secondsToMinutes: function secondsToMinutes(secs) {
    return secs < 50 ? secs + 's' : Math.round(secs / 60) + 'mn';
  }
};
