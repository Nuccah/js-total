// Chargement custom de Bootstrap 3
// ================================

// BS3 s'attend à un `jQuery` global sur `window` :-(…  On le publie juste le temps nécessaire.
window.jQuery = require('jquery');

// On charge les modules de BS3 dont on a besoin…
require('bootstrap/collapse');
require('bootstrap/modal');
require('bootstrap/tooltip');
require('bootstrap/transition');

// Et bye-bye le global !
delete window.jQuery;
