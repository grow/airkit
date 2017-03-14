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
  className: 'ak-modal',
  history: true,
  historyNamePrefix: '',
  transitionDuration: 300,
  onModalOpen: null,
  onModalClose: null
};


/**
 * Modal dialog.
 * @constructor
 */
function Modal(config) {
  this.config = config;
  this.initDom_();

  var closeClass = this.config.className + '-x';
  var data = 'data-' + this.config.className + '-id';
  var func = function(targetEl, e) {
    var modalId = targetEl.getAttribute(data);
    if (modalId) {
      e.preventDefault();
      this.setActive_(true, modalId);
    }
    if (targetEl.classList.contains(closeClass)) {
      this.setActive_(false);
    }
  }.bind(this);
  events.addDelegatedListener(document, 'click', func);

  this.initStateFromHash_();
}


Modal.prototype.hideModalElements_ = function() {
  var attrName = this.config.className;
  var selector = '[data-' + attrName + ']';
  var rules = {};
  rules[selector] = {'display': 'none !important'};
  ui.createStyle(rules);
};


Modal.prototype.initStateFromHash_ = function() {
  var idFromHash = window.location.hash.substr(1);
  if (this.isValidModalId_(idFromHash)) {
    this.setActive_(true, idFromHash, false);
  }
};


Modal.prototype.isValidModalId_ = function(modalId) {
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
  el.appendChild(closeEl);
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
  window.setTimeout(function() {
    classes.enable(lightboxEl, this.config.className + '--enabled', enabled);
  }.bind(this), enabled ? 0 : this.config.transitionDuration);
  window.setTimeout(function() {
    classes.enable(lightboxEl, this.config.className + '--visible', enabled);
  }.bind(this), enabled ? this.config.transitionDuration : 0);
};


/**
 * Sets whether the modal is active. Handles history state if applicable.
 * @param {Boolean} active Whether the modal is active.
 * @param {=string} opt_modalId Modal ID to use in the history hash.
 * @param {=Boolean} opt_updateState Whether to update the history state.
 * @private
 */
Modal.prototype.setActive_ = function(active, opt_modalId, opt_updateState) {
  var activeAttr = 'data-' + this.config.className + '-active-id';
  if (active) {

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
    this.contentContainerEl.appendChild(contentEl);
    this.config.onModalOpen && this.config.onModalOpen(opt_modalId)
  } else {
    var activeId = this.contentContainerEl.getAttribute(activeAttr);
    this.contentContainerEl.removeAttribute(activeAttr);
    var originalContainer = document.querySelector(
        '[data-' + this.config.className + '="' + activeId + '"]');
    if (originalContainer) {
      var currentContentEl = this.contentContainerEl.querySelector('div');
      originalContainer.appendChild(currentContentEl);
    }
    this.config.onModalClose && this.config.onModalClose(activeId)
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
