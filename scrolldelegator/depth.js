/**
 * @fileoverview Calls a function whenever a scroll depth is reached.
 * Ratio-based depths (e.g. 25%, 50%, 75%) are supported.
 */

var objects = require('../utils/objects');
var scrolldelegator = require('.');


var defaultConfig = {
  ratios: [0.25, 0.50, 0.75, 0.95]
};


ScrollDepthCaller = function(cb, config) {
  this.cb = cb;
  this.ratios = config.ratios;
  this.onScroll();
};


ScrollDepthCaller.prototype.onScroll = function() {
  var yPos = scrolldelegator.getScrollPosY();
  var scrollRatio = yPos / (document.body.offsetHeight - window.innerHeight);
  for (var i = 0; i < this.ratios.length; i++) {
    if (scrollRatio > this.ratios[i]) {
      var percentage = this.ratios[i] * 100;
      this.cb(percentage, yPos);
      this.ratios[i] = 200;  // Ensure ratio isn't encountered again.
    }
  }
};


function init(cb, opt_config) {
  var config = objects.clone(defaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }

  var scrollDepthCaller = new ScrollDepthCaller(cb, config);
  scrolldelegator.addDelegate(scrollDepthCaller);
}


module.exports = {
  init: init
};
