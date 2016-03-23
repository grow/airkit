var loaded = false;
var player = null;


function YouTubeModal() {
  if (loaded) {
    return;
  }
  var el = createDom('div', 'ak-youtubemodal');
  var closeEl = createDom('div', 'ak-youtubemodal-x');
  el.appendChild(closeEl);
  el.appendChild(createDom('div', 'ak-youtubemodal-player'));
  el.appendChild(createDom('div', 'ak-youtubemodal-mask'));
  document.body.appendChild(el);

  closeEl.addEventListener('click', function() {
    self.setVisible(false);
  });

  var self = this;
  listen(function(target) {
    var videoId = target.getAttribute('data-ak-youtubemodal-video-id');
    if (videoId) {
      self.play(videoId);
    }
  });

  var tag = document.createElement('script');
  tag.setAttribute('src', 'https://www.youtube.com/iframe_api');
  document.body.appendChild(tag);
  loaded = true;
}


YouTubeModal.prototype.setVisible = function(enabled) {
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

  var lightboxEl = document.querySelector('.ak-youtubemodal');
  window.setTimeout(function() {
    enableClass(lightboxEl, 'ak-youtubemodal--enabled', enabled);
  }, enabled ? 0 : 300);
  window.setTimeout(function() {
    enableClass(lightboxEl, 'ak-youtubemodal--visible', enabled);
  }, enabled ? 10 : 0);
}


YouTubeModal.prototype.play = function(videoId) {
  /*
  if (goog.userAgent.MOBILE) {
    window.location.href = 'https://m.youtube.com/watch?v=' + videoId;
  } else {
  }
  */
  this.setVisible(true);

  if (player) {
    return;
  }
  var playerEl = document.querySelector('.ak-youtubemodal-player');
  var options = {
    'videoId': videoId,
    'playerVars': {
      'autohide': 1,
      'autoplay': 1,
      'fs': 1,
      'modestbranding': 1,
      'rel': 0,
      'showinfo': 0,
      'iv_load_policy': 3
    }
  };
  player = new YT.Player(playerEl, options);
}


/**
 * Initializes the scroll listener for all elements tagged with the
 * "ak-scrolltoggle" class (configurable using the "className" config).
 * @param {Object=} opt_config Config options.
 */
function init(opt_config) {
  new YouTubeModal();
}


function createDom(tagName, opt_className) {
  var element = document.createElement(tagName);
  if (opt_className) {
    element.className = opt_className;
  }
  return element;
}


function listen(callback) {
  document.addEventListener('click', function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    target = target.nodeType == 3 ? target.parentNode : target;
    do {
      callback(target);
      if (target.parentNode) {
        target = target.parentNode;
      }
    } while (target.parentNode);
  });
}


function enableClass(el, className, enabled) {
  if (enabled) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
}


module.exports = {
  init: init
};
