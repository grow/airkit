/**
 * Conditionally displays elements based on the date.
 */

var objects = require('../utils/objects');
var ui = require('../ui');
var uri = require('../utils/uri');

var defaultConfig = {
  attributeName: 'data-ak-datetoggle',
  parameterName: 'ak-now'
}


function DateToggle(config) {
  this.config = config;
  this.initDom_();
  initStyle(config);
};


DateToggle.isEnabledNow = function(start, end, now) {
  if (start && end) {
    return now >= start && now < end;
  } else if (start) {
    return now >= start;
  } else if (end) {
    return now < end;
  }
  return false;
}


DateToggle.prototype.initDom_ = function() {
  var els = document.querySelectorAll('[' + this.config.attributeName + ']');
  var dateFromParam = uri.getParameterValue(this.config.parameterName);
  var now = dateFromParam ? new Date(dateFromParam) : new Date();
  [].forEach.call(els, function(el) {
    this.processElement_(el, now);
  }.bind(this));
};


DateToggle.prototype.processElement_ = function(el, now) {
  var startAttrName = this.config.attributeName + '-start';
  var endAttrName = this.config.attributeName + '-end';
  var startString = el.getAttribute(startAttrName);
  var endString = el.getAttribute(endAttrName);
  var start = startString ? new Date(startString) : null;
  var end = endString ? new Date(endString) : null;
  var enabled = DateToggle.isEnabledNow(start, end, now);
  if (enabled) {
    el.removeAttribute(this.config.attributeName);
  }
};


/**
 * Creates the styles used for toggling dates. Permits usage of datetoggle
 * without needing to manually add styles to the page. You can optionally
 * call this at the top of the page to avoid FOUC.
 */
function initStyle(opt_config) {
  var config = objects.clone(defaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }
  var attrName = config.attributeName;
  var selector = '[' + attrName + ']';
  var rules = {};
  rules[selector] = {'display': 'none !important'};
  ui.createStyle(rules);
}


function init(opt_config) {
  var config = objects.clone(defaultConfig);
  if (opt_config) {
    objects.merge(config, opt_config);
  }
  return new DateToggle(config);
}


module.exports = {
  isEnabledNow: DateToggle.isEnabledNow,
  initStyle: initStyle,
  init: init
};
