/**
 * @fileoverview A utility for automatically tracking interactions with
 * elements based on various criteria.
 */

var events = require('../utils/events');
var objects = require('../utils/objects');
var uri = require('../utils/uri');


var defaultConfig = {
  attributes: [],
  attributePrefix: 'data-ak-tracking-',
  overlayEnabled: false,
  overlayParam: 'ak-tracking-help',
  elements: ['a', 'button']
};


var TrackingObject = function() {
  this.attrs = null;
  this.element = null;
  this.label = null;
  this.linkCategory = null;
  this.linkCategoryName = null;
};


var Tracker = function(cb, config) {
  this.cb = cb;
  this.config = config;
  events.addDelegatedListener(document, 'click',
      this.clickCallback_.bind(this));

  if (this.config.overlayEnabled
      && uri.getParameterValue(this.config.overlayParam)) {
    this.initOverlay_();
  }
};


Tracker.LinkCategory = {
  BUTTON: 'button',
  GENERIC: 'generic',
  INTERNAL: 'internal',
  OUTBOUND: 'outbound'
};


Tracker.prototype.getNameForLinkCategory = function(linkCategory) {
  switch (linkCategory) {
    case Tracker.LinkCategory.BUTTON:
      return 'Auto: Button';
    case Tracker.LinkCategory.GENERIC:
      return 'Auto: Element';
    case Tracker.LinkCategory.INTERNAL:
      return 'Auto: Internal';
    case Tracker.LinkCategory.OUTBOUND:
      return 'Auto: Outbound';
  }
};


Tracker.prototype.getLinkCategory_ = function(el) {
  if (el.tagName.toLowerCase() == 'a') {
    if (el.hostname == window.location.hostname) {
      return Tracker.LinkCategory.INTERNAL;
    }
    return Tracker.LinkCategory.OUTBOUND;
  } else if (el.tagName.toLowerCase() == 'button') {
    return Tracker.LinkCategory.BUTTON;
  }
  return Tracker.LinkCategory.GENERIC;
};


Tracker.prototype.parseAttrs_ = function(el) {
  var namesToValues = {};
  for (var i = 0; i < el.attributes.length; i++) {
    var attr = el.attributes[i];
    var attrName = attr.name;
    if (attrName.indexOf(this.config.attributePrefix) > -1) {
      var cleanAttrName = attr.name.replace(this.config.attributePrefix, '');
      namesToValues[cleanAttrName] = attr.value;
    }
  }
  return namesToValues;
};


Tracker.prototype.initOverlay_ = function() {
  [].forEach.call(document.querySelectorAll('*'), function(el) {
    if (!this.shouldTrack_(el)) {
      return
    }
    var helpEl = document.createElement('div');
    helpEl.setAttribute('class', 'data-ak-tracking-overlay');
    var hintEl = document.createElement('span');
    hintEl.textContent = el.nodeName.toLowerCase();
    helpEl.appendChild(hintEl);
    var attrs = this.parseAttrs_(el);
    for (var key in attrs) {
      var val = attrs[key];
      var hintEl = document.createElement('span');
      hintEl.textContent = key + ': ' + val;
      helpEl.appendChild(hintEl);
    };
    el.parentNode.insertBefore(helpEl, el);
  }.bind(this));
  var styleEl = document.createElement('style');
  document.body.appendChild(styleEl);
  styleEl.sheet.insertRule('.data-ak-tracking-overlay {position: absolute; color: white; font-weight: 500; font-size: 11px; font-family: verdana; z-index: 999; pointer-events: none;}', 0);
  styleEl.sheet.insertRule('.data-ak-tracking-overlay span:first-child {background: black;}', 0);
  styleEl.sheet.insertRule('.data-ak-tracking-overlay span {padding: 4px 7px; display: block; background: #222;}', 0);
};


Tracker.prototype.getLabel = function(el) {
  return el.textContent.trim();
};


Tracker.prototype.getTrackingObject = function(el) {
  var obj = new TrackingObject();
  obj.attrs = this.parseAttrs_(el);
  obj.element = el;
  obj.label = this.getLabel(el);
  obj.linkCategory = this.getLinkCategory_(el);
  obj.linkCategoryName = this.getNameForLinkCategory(obj.linkCategory);
  return obj;
};


Tracker.prototype.track_ = function(el) {
  var obj = this.getTrackingObject(el);
  this.cb(el, obj);
};


Tracker.prototype.shouldTrack_ = function(el) {
  for (var i = 0; i < el.attributes.length; i++) {
    var attr = el.attributes[i];
    var attrName = attr.name;
    // Track if any of the attributes match the attribute prefix.
    if (attrName.indexOf(this.config.attributePrefix) > -1) {
      return true;
    }
    // Track if any of the attributes match an explicit list of attributes.
    if (this.config.attributes.indexOf(attrName) > -1) {
      return true;
    }
  }

  // Track if the element is one of our default elements.
  var elName = el.nodeName.toLowerCase();
  if (this.config.elements.indexOf(elName) > -1) {
    return true;
  }

  return false;
};


Tracker.prototype.clickCallback_ = function(el) {
  if (this.shouldTrack_(el)) {
    this.track_(el);
  }
};


function init(cb, opt_config) {
  var config = objects.clone(defaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }
  var tracker = new Tracker(cb, config);
  return tracker;
};


module.exports = {
  init: init
};
