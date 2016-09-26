/**
 * @fileoverview Utility functions related to whether an element is visible in
 * the viewport.
 */

var classes = require('../utils/classes');
var objects = require('../utils/objects');
var scrolldelegator = require('../scrolldelegator');
var ui = require('../ui');
var video = require('../utils/video');


/**
 * Adds a class to elements when they become visible in the viewport.
 * @param {string} selector Query selector to find elements to act upon.
 * @param {string} className Class name to add to matched elements.
 * @param {number=} opt_offset Offset (by percentage of the element) to
 *     apply when checking if the element is in view.
 * @param {Array.<number>=} opt_delay An array of [min delay, max delay].
 */
var InViewClassAdder = function(selector, className, opt_offset, opt_delay) {
  this.selector = selector;
  this.className = className;
  this.offset = opt_offset || null;
  this.delay = opt_delay || 0;
}; 


InViewClassAdder.DefaultConfig = {
  selector: '.ak-in-view--start',
  className: 'ak-in-view--end',
  offset: null,
  delay: 0,
};


/** Finds elements and adds classes if they're in view. */
InViewClassAdder.prototype.onScroll = function() {
  var els = document.querySelectorAll(this.selector);
  [].forEach.call(els, function(el) {
    if (ui.isElementInView(el, this.offset)) {
      if (this.delay) {
        var min = this.delay[0];
        var max = this.delay[1];
        var timeout = Math.floor(Math.random() * (max - min)) + min;
        window.setTimeout(function() {
          classes.enable(el, this.className, true);
        }.bind(this), timeout);
      } else {
        classes.enable(el, this.className, true);
      }
    }
  }.bind(this));
};


/**
 * Adds a class to elements when they become visible in the viewport.
 * @param {Object} config Config object. Properties are:
 *     selector: The selector to query elements to act upon.
 *     className: The class name to add when elements come in view.
 *     offset (optional): Offset to apply when checking if the element is in
 *         view.
 *     delay (optional): A list of a maximum and minimum delay to apply the new
 *         class. For example, a delay of [200, 500] will apply the new class
 *         at a random time between 200ms and 500ms. This can be used to, for
 *         example, playfully transition new elements on screen as they enter
 *         the viewport.
 */
function addClassInView(config) {
  var selector = config.selector || InViewClassAdder.DefaultConfig.selector;
  var className = config.className || InViewClassAdder.DefaultConfig.className;
  var delay = config.delay || InViewClassAdder.DefaultConfig.delay;
  var offset = config.offset;
  var classAdder = new InViewClassAdder(selector, className, offset, delay);
  classAdder.onScroll();
  scrolldelegator.addDelegate(classAdder);
  scrolldelegator.start();
}


/**
 * Plays videos when they enter the viewport.
 * @param {string} selector Query selector to find elements to act upon.
 * @param {number=} opt_offset Offset (by percentage of the element) to
 *     apply when checking if the element is in view.
 * @param {Array.<number>=} opt_delay An array of [min delay, max delay].
 */
var InViewPlayer = function(selector, opt_offset, opt_delay) {
  this.selector = selector;
  this.offset = opt_offset || null;
  this.delay = opt_delay || 0;

  // Ensure all videos are loaded.
  var els = document.querySelectorAll(this.selector);
  [].forEach.call(els, function(el) {
    el.load();
  });
};


/** Conditionally plays a video. */
InViewPlayer.prototype.playIfNotPlaying = function(el) {
  if ((el.currentTime || el.paused) && !el.ended) {
    el.play();
  }
};


/** Finds videos and plays them if they're in view. */
InViewPlayer.prototype.onScroll = function() {
  var els = document.querySelectorAll(this.selector);
  [].forEach.call(els, function(el) {
    if (ui.isElementInView(el, this.offset)) {
      if (this.delay) {
        var min = this.delay[0];
        var max = this.delay[1];
        var timeout = Math.floor(Math.random() * (max - min)) + min;
        window.setTimeout(function() {
          this.playIfNotPlaying(el);
        }.bind(this), timeout);
      } else {
        this.playIfNotPlaying(el);
      }
    }
  }.bind(this));
};


InViewPlayer.DefaultConfig = {
  selector: 'video.ak-in-view-video',
  offset: null,
  delay: 0,
};


function playVideoInView(opt_config) {
  if (!video.canPlayVideo()) {
    return;
  }
  var config = objects.clone(InViewPlayer.DefaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }
  var player = new InViewPlayer(
      config.selector, config.offset, config.delay);
  player.onScroll();
  scrolldelegator.addDelegate(player);
  scrolldelegator.start();
}


module.exports = {
  addClassInView: addClassInView,
  playVideoInView: playVideoInView
};
