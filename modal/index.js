/**
 * @fileoverview Creates a modal.
 */

var classes = require('../utils/classes');
var dom = require('../utils/dom');
var events = require('../utils/events');
var objects = require('../utils/objects');
var ui = require('../ui');
var useragent = require('../utils/useragent');


var modalInstance = null;
var defaultConfig = {
  addCloseButtonToDocument: false,
  className: 'ak-modal',
  history: true,
  historyNamePrefix: '',
  transitionDuration: 300,
  visibilityDuration: 0,
  onModalOpen: null,
  onModalClose: null,
  setScrollOnClose: true,
};


/**
 * Modal dialog.
 * @constructor
 */
function Modal(config) {
  this.config = config;
  this.timers_ = [];
  this.scrollY = 0;
  this.lastFocusedEl_ = null;

  this.initDom_();

  var closeAttribute = 'data-' + this.config.className + '-x';
  var closeClass = this.config.className + '-x';
  var data = 'data-' + this.config.className + '-id';
  var func = function(targetEl, e) {
    // Handle both key presses and mouse clicks.
    // If key press isn't "space" or "return" to trigger the modal, return.
    if (e.keyCode) {
      if (e.keyCode !== 32 && e.keyCode !== 13) {
        return;
      }
    }
    var modalId = targetEl.getAttribute(data);
    if (modalId) {
      e.preventDefault();
      this.setActive_(true, modalId);
    }
    if (targetEl.classList.contains(closeClass)
        || targetEl.hasAttribute(closeAttribute)) {
      this.setActive_(false);
    }
  }.bind(this);
  events.addDelegatedListener(document, 'click', func);
  events.addDelegatedListener(document, 'keydown', func);

  this.initStateFromHash_();
}


Modal.prototype.hideModalElements_ = function() {
  var attrName = this.config.className;
  var selector = '[data-' + attrName + ']';
  var rules = {};
  rules[selector] = {'display': 'none !important'};
  ui.createStyle(rules);
};


/**
 * Gets the first hash value in a string.
 * For example #modal-id#deep-link-within-modal. In this event, return the
 * first hash.
 */
Modal.prototype.getFirstHash_ = function(hash) {
  if (hash.includes('#')) {
    hash = hash.split('#')[0];
  }
  return hash;
}


Modal.prototype.initStateFromHash_ = function() {
  var idFromHash = this.getFirstHash_(window.location.hash.substr(1));

  if (this.isValidModalId_(idFromHash)) {
    this.setActive_(true, idFromHash, false);
  }
};


Modal.prototype.isValidModalId_ = function(modalId) {
  // Empty ids are not valid; prevent opening an arbitrary modal by default.
  if (!modalId) {
    return false;
  }
  var modalEls = document.querySelectorAll(
      '[data-' + this.config.className + ']');
  var valid = false;
  [].forEach.call(modalEls, function(el) {
    var elModalId = el.getAttribute('data-' + this.config.className);
    if (elModalId == modalId) {
      valid = true;
    }
  }.bind(this));
  return valid;
};


/**
 * Creates the DOM for the modal.
 * @private
 */
Modal.prototype.initDom_ = function() {
  var createDom = dom.createDom;
  var el = createDom('div', this.config.className);
  var closeEl = createDom('div', this.config.className + '-x');
  closeEl.setAttribute('aria-label', 'Close');
  closeEl.setAttribute('role', 'button');
  closeEl.setAttribute('tabindex', '0');
  if (this.config.addCloseButtonToDocument) {
    document.documentElement.appendChild(closeEl);
  } else {
    el.appendChild(closeEl);
  }
  el.appendChild(createDom('div', this.config.className + '-mask'));
  var contentContainerEl = createDom('div', this.config.className + '-content')
  el.appendChild(contentContainerEl);
  document.body.appendChild(el);

  this.contentContainerEl = contentContainerEl;

  if (this.config.history) {
    window.addEventListener('popstate', this.onHistoryChange_.bind(this));
  }
};


/**
 * Sets the modal's visibility.
 * @param {Boolean} enabled Whether the modal should be visible.
 */
Modal.prototype.setVisible = function(enabled) {
  var _keyToggle = function(e) {
    if (e.keyCode == 27) {
      this.setActive_(false);
      document.body.removeEventListener('keydown', _keyToggle);
    }
  }.bind(this);

  if (enabled) {
    document.body.addEventListener('keydown', _keyToggle);
  } else {
    document.body.removeEventListener('keydown', _keyToggle);
  }

  var lightboxEl = document.querySelector('.' + this.config.className);

  var enterClass = this.config.className + '--enter';
  var exitClass = this.config.className + '--exit';
  window.setTimeout(function() {
    if (enabled) {
      lightboxEl.classList.remove(exitClass);
      lightboxEl.classList.add(enterClass);
      this.scrollY = window.pageYOffset;
      // Set the focus to the modal element. Store the most recent focused element
      // to restore focus back to the page when closed.
      this.lastFocusedEl_ = document.activeElement;
      // Focus on the newly opened modal.
      window.setTimeout(
          function() {
            lightboxEl.focus();
          },
          this.config.transitionDuration + 10);
    } else {
      lightboxEl.classList.remove(enterClass);
      lightboxEl.classList.add(exitClass);
      if (this.config.setScrollOnClose) {
        window.scrollTo(0, this.scrollY);
      }
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
  }, 0);

  var enableTimer = window.setTimeout(function() {
    classes.enable(lightboxEl, this.config.className + '--enabled', enabled);
  }.bind(this), enabled ? 0 : this.config.transitionDuration);
  this.timers_.push(enableTimer);

  var visibleTimer = window.setTimeout(function() {
    classes.enable(lightboxEl, this.config.className + '--visible', enabled);
  }.bind(this), enabled ? this.config.visibilityDuration ||
    this.config.transitionDuration : 0);
  this.timers_.push(visibleTimer);
};


/**
 * Sets whether the modal is active. Handles history state if applicable.
 * @param {Boolean} active Whether the modal is active.
 * @param {string=} opt_modalId Modal ID to use in the history hash.
 * @param {Boolean=} opt_updateState Whether to update the history state.
 * @private
 */
Modal.prototype.setActive_ = function(active, opt_modalId, opt_updateState) {
  var activeAttr = 'data-' + this.config.className + '-active-id';
  this.clearTimers_();
  if (active) {
    this.returnContentToOrigin_();

    // Revert child node to original element which may exist if modal is
    // consecutively opened without first being closed.
    if (this.contentContainerEl.firstChild) {
      var activeId = this.contentContainerEl.getAttribute(activeAttr);
      this.contentContainerEl.removeAttribute(activeAttr);
      var originalContainer = document.querySelector(
          '[data-' + this.config.className + '="' + activeId + '"]');
      if (originalContainer) {
        originalContainer.appendChild(this.contentContainerEl.firstChild);
      }
    }

    var containerEl = document.querySelector(
        '[data-' + this.config.className + '="' + opt_modalId + '"]');
    var contentEl = containerEl.querySelector('div');
    this.contentContainerEl.setAttribute(activeAttr, opt_modalId);
    contentEl && this.contentContainerEl.appendChild(contentEl);
    this.config.onModalOpen && this.config.onModalOpen(opt_modalId, this)
  } else {
    this.config.onModalClose && this.config.onModalClose(activeId, this)
  }
  this.setVisible(active);
  if (!this.config.history || opt_updateState === false) {
    return;
  }
  this.activeModalId_ = opt_modalId;
  var akModalId = opt_modalId || this.activeModalId_;
  if (active) {
    // Avoid pushing two equal items onto the state.
    var stateId = window.history.state && window.history.state['akModalId'];
    if (stateId == akModalId) {
      return;
    }
    window.history.pushState(
        {'akModalId': akModalId}, '',
        '#' + this.config.historyNamePrefix + akModalId);
  } else {
    window.history.pushState(
        {'akModalId': null}, '', window.location.pathname);
  }
};


/**
 * Reverts modal contents back to it's original element.
 * @private
 */
Modal.prototype.returnContentToOrigin_ = function() {
  if(!this.contentContainerEl) {
    return;
  }
  var activeAttr = 'data-' + this.config.className + '-active-id';
  var activeId = this.contentContainerEl.getAttribute(activeAttr);
  this.contentContainerEl.removeAttribute(activeAttr);
  var originalContainer = document.querySelector(
      '[data-' + this.config.className + '="' + activeId + '"]');

  if (originalContainer) {
    var currentContentEl = this.contentContainerEl.querySelector('div');
    currentContentEl && originalContainer.appendChild(currentContentEl);
  }
}


/**
 * Clears all interval timers.
 * @private
 */
Modal.prototype.clearTimers_ = function() {
  this.timers_.forEach(function(timer) {
    window.clearTimeout(timer);
  });
  this.timers_ = [];
}


/**
 * Callback for changes to the history state.
 * @param {Event} e Pop state event.
 * @private
 */
Modal.prototype.onHistoryChange_ = function(e) {
  var activeId = e.state && e.state['akModalId'];
  var idFromHash = window.location.hash.substr(1);
  if (!activeId && this.isValidModalId_(idFromHash)) {
    activeId = idFromHash;
  }
  this.setActive_(Boolean(activeId), activeId, false);
};


/**
 * Initializes a modal dialog singleton.
 * @param {Object=} opt_config Config options.
 */
function init(opt_config) {
  if (modalInstance) {
    return;
  }
  var config = objects.clone(defaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }

  modalInstance = new Modal(config);
}


/**
 * Opens modal by a specific id.
 */
function openById(id) {
  modalInstance && modalInstance.setActive_(true, id, true);
}

/**
 * Closes current modal
 */
function close() {
  modalInstance && modalInstance.setActive_(false, null, true);
}


module.exports = {
  init: init,
  openById: openById,
  close: close,
  Modal: Modal
};
