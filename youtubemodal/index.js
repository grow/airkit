/**
 * @fileoverview Creates a YouTube player in a modal.
 */

var classes = require('../utils/classes');
var dom = require('../utils/dom');
var events = require('../utils/events');
var objects = require('../utils/objects');
var useragent = require('../utils/useragent');


var initted = false;
var player = null;
var defaultConfig = {
  useHandlerOnMobile: true,
  transitionDuration: 300,
  className: 'ak-youtubemodal',
  playerVars: {
    'autohide': 1,
    'autoplay': 1,
    'fs': 1,
    'modestbranding': 1,
    'rel': 0,
    'showinfo': 0,
    'iv_load_policy': 3
  }
};


/**
 * Plays a YouTube video in a modal dialog
 * @constructor
 */
function YouTubeModal(config) {
  this.config = config;
  this.initDom_();

  var func = function(targetEl) {
    var data = 'data-' + this.config.className + '-video-id';
    var videoId = targetEl.getAttribute(data);
    if (videoId) {
      this.play(videoId);
    }
  }.bind(this);

  // Loads YouTube iframe API.
  events.addDelegatedListener(document, 'click', func);
  var tag = document.createElement('script');
  tag.setAttribute('src', 'https://www.youtube.com/iframe_api');
  document.body.appendChild(tag);
}


/**
 * Creates the DOM for the YouTube modal.
 * @private
 */
YouTubeModal.prototype.initDom_ = function() {
  var createDom = dom.createDom;
  var el = createDom('div', this.config.className);
  var closeEl = createDom('div', this.config.className + '-x');
  el.appendChild(closeEl);
  el.appendChild(createDom('div', this.config.className + '-player'));
  el.appendChild(createDom('div', this.config.className + '-mask'));
  document.body.appendChild(el);
  closeEl.addEventListener('click', function() {
    this.setVisible(false);
  }.bind(this));
};


/**
 * Sets the modal's visibility.
 * @param {Boolean} enabled Whether the modal should be visible.
 */
YouTubeModal.prototype.setVisible = function(enabled) {
  // Plays or pauses depending on visibility.
  if (player) {
    if (enabled) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }

  var _keyToggle = function(e) {
    if (e.keyCode == 27) {
      this.setVisible(false);
      document.body.removeEventListener('keydown', _keyToggle);
    }
  }.bind(this);

  if (enabled) {
    document.body.addEventListener('keydown', _keyToggle);
  } else {
    document.body.removeEventListener('keydown', _keyToggle);
  }

  var lightboxEl = document.querySelector('.' + this.config.className);
  window.setTimeout(function() {
    classes.enable(lightboxEl, this.config.className + '--enabled', enabled);
  }.bind(this), enabled ? 0 : this.config.transitionDuration);
  window.setTimeout(function() {
    classes.enable(lightboxEl, this.config.className + '--visible', enabled);
  }.bind(this), enabled ? this.config.transitionDuration : 0);
}


/**
 * Plays a YouTube video.
 * @param {string} videoId Video ID to play.
 */
YouTubeModal.prototype.play = function(videoId) {
  if (this.config.useHandlerOnMobile &&
      (useragent.isIOS() || useragent.isAndroid())) {
    window.location.href = 'https://m.youtube.com/watch?v=' + videoId;
  } else {
    this.setVisible(true);
  }

  if (player) {
    return;
  }
  var playerEl = document.querySelector('.' + this.config.className + '-player');
  var options = {
    'videoId': videoId,
    'playerVars': objects.clone(this.config.playerVars)
  };
  player = new YT.Player(playerEl, options);
}


/**
 * Initializes a YouTube modal dialog singleton.
 * @param {Object=} opt_config Config options.
 */
function init(opt_config) {
  if (initted) {
    return;
  }
  var config = objects.clone(defaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }

  new YouTubeModal(config);
  initted = true;
}


module.exports = {
  init: init
};
