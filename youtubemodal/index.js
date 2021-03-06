/**
 * @fileoverview Creates a YouTube player in a modal.
 */

var classes = require('../utils/classes');
var dom = require('../utils/dom');
var events = require('../utils/events');
var objects = require('../utils/objects');
var useragent = require('../utils/useragent');


var player = null;
var singleton = null;
var defaultConfig = {
  useHandlerOnMobile: true,
  history: false,
  historyNamePrefix: 'video:',
  transitionDuration: 300,
  className: 'ak-youtubemodal',
  parentSelector: 'body',
  onModalOpen: null,
  onModalClose: null,
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
 * Plays a YouTube video in a modal dialog.
 * @constructor
 */
function YouTubeModal(config) {
  this.config = config;
  this.parentElement = document.querySelector(this.config.parentSelector);
  this.closeEventListener_ = this.setActive_.bind(this, false);
  this.popstateListener_ = this.onHistoryChange_.bind(this);
  this.el_ = null;
  this.closeEl_ = null;
  this.attributionEl_ = null;
  this.initDom_();
  this.lastActiveVideoId_ = null;
  this.scrollY = 0;
  this.lastFocusedEl_ = null;

  this.delegatedListener_ = function(targetEl, e) {
    // Handle both key presses and mouse clicks.
    // If key press isn't "space" or "return" to trigger the modal, return.
    if (e.keyCode) {
      if (e.keyCode !== 32 && e.keyCode !== 13) {
        return;
      }
    }
    var data = 'data-' + this.config.className + '-video-id';
    var videoId = targetEl.getAttribute(data);
    var startDataAttribute = 'data-' + this.config.className + '-video-start-seconds';
    var startTime = +targetEl.getAttribute(startDataAttribute);
    var attributionAttribute = 'data-' + this.config.className + '-attribution';
    var attribution = targetEl.getAttribute(attributionAttribute);
    if (videoId) {
      e.preventDefault();  // Prevent "space" from scrolling the page.
      this.play(videoId, true /* opt_updateState */, startTime, attribution);
    }

    var closeClass = this.config.className + '-x';
    var closeAttribute = 'data-' + this.config.className + '-x';
    if (targetEl.classList.contains(closeClass)
        || targetEl.hasAttribute(closeAttribute)) {
      this.setActive_(false);
    }
  }.bind(this);

  // Loads YouTube iframe API.
  events.addDelegatedListener(document, 'click', this.delegatedListener_);
  events.addDelegatedListener(document, 'keydown', this.delegatedListener_);

  // Only add the script tag if it doesn't exist
  var scriptTag =
    document.querySelector('script[src="https://www.youtube.com/iframe_api?trustedtypes=1"]');
  if (!scriptTag) {
    var tag = document.createElement('script');
    tag.setAttribute('src', 'https://www.youtube.com/iframe_api?trustedtypes=1');
    this.parentElement.appendChild(tag);
  }
}


/**
 * Creates the DOM for the YouTube modal.
 * @private
 */
YouTubeModal.prototype.initDom_ = function() {
  var createDom = dom.createDom;
  this.el_ = createDom('div', this.config.className);
  this.el_.setAttribute('aria-modal', 'true');
  this.el_.setAttribute('role', 'dialog');
  this.closeEl_ = createDom('div', this.config.className + '-x');
  this.closeEl_.setAttribute('aria-label', 'Close video player');
  this.closeEl_.setAttribute('role', 'button');
  this.closeEl_.setAttribute('tabindex', '0');
  this.attributionEl_ = createDom('div', this.config.className + '-attribution');
  this.el_.appendChild(this.closeEl_);
  this.el_.appendChild(this.attributionEl_);
  this.el_.appendChild(createDom('div', this.config.className + '-player'));
  this.el_.appendChild(createDom('div', this.config.className + '-mask'));
  this.parentElement.appendChild(this.el_);
  this.closeEl_.addEventListener('click', this.closeEventListener_);

  if (this.config.history) {
    window.addEventListener('popstate', this.popstateListener_);
  }
};

YouTubeModal.prototype.dispose = function() {
  this.closeEl_.removeEventListener('click', this.closeEventListener_);
  this.parentElement.removeChild(this.el_);
  events.removeDelegatedListener(document, 'click', this.delegatedListener_);
  events.removeDelegatedListener(document, 'keydown', this.delegatedListener_);
  if (this.config.history) {
    window.removeEventListener('popstate', this.popstateListener_);
  }
};

/**
 * Sets the modal's visibility.
 * @param {boolean} enabled Whether the modal should be visible.
 */
YouTubeModal.prototype.setVisible = function(enabled) {
  var closeEl = this.closeEl_;
  var transitionDuration = this.config.transitionDuration;
  // Plays or pauses depending on visibility.
  if (player) {
    // Delay call to give player time to load.
    window.setTimeout(function() {
      if (enabled) {
        player.playVideo();
        window.setTimeout(
            function() {
              closeEl.focus();
            },
            transitionDuration);
      } else {
        player.pauseVideo();
      }
    }, 100);
  }

  var _keyToggle = function(e) {
    if (e.keyCode === 27 /* esc */) {
      this.setActive_(false);
      document.body.removeEventListener('keydown', _keyToggle);
    } else if (e.keyCode === 32 /* space */) {
      if (player.getPlayerState() === 1 /* playing */) {
        player.pauseVideo();
      } else {
        player.playVideo();
        closeEl.focus();
      }
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
};

/**
 * Sets whether the modal is active (and thus visible and playing). Handles history state if applicable.
 * @param {boolean} active Whether the modal is active.
 * @param {string=} opt_videoId Video ID to use in the history hash.
 * @param {boolean=} opt_updateState Whether to update the history state.
 * @private
 */
YouTubeModal.prototype.setActive_ = function(active, opt_videoId, opt_updateState) {
  if (opt_videoId) {
    this.lastActiveVideoId_ = opt_videoId;
  }

  if (active) {
    this.config.onModalOpen && this.config.onModalOpen(this.lastActiveVideoId_);
    this.scrollY = window.pageYOffset;

    // Set the focus to the modal element. Store the most recent focused element
    // to restore focus back to the page when closed.
    this.lastFocusedEl_ = document.activeElement;
    // Focus on the "close" button since it's the only focusable element in the
    // modal.
    var closeEl = this.closeEl_;
    window.setTimeout(
        function() {
          closeEl.focus();
        },
        this.config.transitionDuration + 10);
  } else {
    this.config.onModalClose && this.config.onModalClose(this.lastActiveVideoId_);
    window.scrollTo(0, this.scrollY);

    // Restore focus to the element that was active prior to the modal being opened.
    if (this.lastFocusedEl_) {
      var lastFocusedEl = this.lastFocusedEl_;
      window.setTimeout(
          function() {
            lastFocusedEl.focus();
            lastFocusedEl = null;
          },
          this.config.transitionDuration + 10);
    }
  }
  if (!this.config.history) {
    this.setVisible(active);
    return;
  }

  this.setVisible(active);
  if (opt_updateState === false) {
    return;
  }
  var videoId = opt_videoId || this.activeVideoId_;
  if (active) {
    // Avoid pushing two equal items onto the state.
    var stateId = window.history.state && window.history.state['videoId'];
    if (stateId == videoId) {
      return;
    }
    window.history.pushState(
      {'videoId': videoId}, '',
      '#' + this.config.historyNamePrefix + videoId);
  } else {
    window.history.pushState(
      {'videoId': null}, '', window.location.pathname);
  }
};


/**
 * Callback for changes to the history state.
 * @param {Event} e Pop state event.
 * @private
 */
YouTubeModal.prototype.onHistoryChange_ = function(e) {
  if (e.state && e.state['videoId']) {
    this.play(e.state['videoId'], false);
  } else {
    this.setVisible(false);
  }
};


/**
 * Plays a YouTube video.
 * @param {string} videoId Video ID to play.
 * @param {boolean=} opt_updateState Whether to update the history state.
 * @param {number=} opt_startTime A specific time in the video to start at.
 * @param {string} opt_attribution Attribution text to overlay on top of the video.
 */
YouTubeModal.prototype.play = function(videoId, opt_updateState, opt_startTime, opt_attribution) {
  var useHandler = (
    this.config.useHandlerOnMobile
    && (useragent.isIOS() || useragent.isAndroid()));

  if (useHandler) {
    var url = 'https://m.youtube.com/watch?v=' + videoId;
    if (opt_startTime) {
      url += '&t=' + opt_startTime + 's';
    }
    window.location.href = url;
    return;
  }

  if (opt_attribution) {
    this.attributionEl_.textContent = opt_attribution;
  } else {
    this.attributionEl_.textContent = '';
  }

  this.setActive_(true, videoId, opt_updateState);
  if (player && videoId == this.activeVideoId_) {
    return;
  } else if (player && videoId != this.activeVideoId_) {
    var startTime = 0;
    if (opt_startTime) {
      startTime = opt_startTime;
    }
    player.loadVideoById(videoId, startTime, 'large');
    this.activeVideoId_ = videoId;
    return;
  }
  var playerEl = document.querySelector('.' + this.config.className + '-player');
  var playerVars = objects.clone(this.config.playerVars);
  if (opt_startTime) {
    playerVars['start'] = opt_startTime;
  }
  playerVars['origin'] = location.protocol + '//' + location.host;

  var closeEl = this.closeEl_;
  var options = {
    'videoId': videoId,
    'playerVars': playerVars,
    'events': {
      // Need to do this to force autoplay on mobile
      'onReady': function(event) {
        closeEl.focus();
        event.target.playVideo();
      },
    },
  };
  player = new YT.Player(playerEl, options);
  this.activeVideoId_ = videoId;
};


/**
 * Initializes a YouTube modal dialog singleton.
 * @param {Object=} opt_config Config options.
 */
function init(opt_config) {
  if (singleton) {
    return;
  }
  var config = objects.clone(defaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }

  singleton = new YouTubeModal(config);
}


function setScrollY(scrollYValue) {
  if (!singleton) {
    throw 'youtubemodal.init must be run first.';
  }
  return singleton.scrollY = scrollYValue;
}

function dispose() {
  if (!singleton) {
    return;
  }
  singleton.dispose();
  singleton = null;
  if (player) {
    player.destroy();
    player = null;
  }
}

/**
 * Plays a YouTube video in a modal, without requiring a click on an element.
 * @param {string} videoId YouTube video ID.
 */
function play(videoId) {
  if (!singleton) {
    throw 'youtubemodal.init must be run first.';
  }
  return singleton.play(videoId);
}


module.exports = {
  dispose: dispose,
  init: init,
  play: play,
  setScrollY: setScrollY
};
