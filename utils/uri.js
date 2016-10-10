/**
 * @fileoverview Utility functions related to URIs.
 */

var objects = require('./objects');


/**
 * Returns the value of a key in a query string.
 */
function getParameterValue(key, opt_uri) {
  var uri = opt_uri || window.location.href;
  key = key.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
  var regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
  var results = regex.exec(uri);
  return results === null ? null : results[1];
}


var UpdateParamsFromUrlDefaultConfig = {
  selector: 'a.ak-update-params[href]',
  attr: 'href',
  params: null,  // required
};


/**
 * Updates the URL attribute of elements with query params from the current URL.
 * @param {Object} config Config object. Properties are:
 *     selector: CSS query selector of elements to act upon.
 *     attr: The element attribute to update.
 *     params: A list of URL params (string or RegExp) to set on the element
 *         attr from the current URL.
 */
function updateParamsFromUrl(config) {
  var c = objects.clone(UpdateParamsFromUrlDefaultConfig);
  objects.merge(c, config);
  var selector = c.selector;
  var attr = c.attr;
  var params = c.params;
  if (!params) {
    throw '`params` is required';
  }

  var vals = {};
  var currentUrl = new URL(location.href);
  var keysIter = currentUrl.searchParams.keys();
  while (true) {
    var item = keysIter.next();
    if (item.done) {
      break;
    }
    var key = item.value;
    for (var i = 0; i < params.length; i++) {
      // TODO(stevenle): support keys that have multiple values.
      var param = params[i];
      if (param instanceof RegExp) {
        if (key.match(param)) {
          vals[key] = currentUrl.searchParams.get(key);
        }
      } else {
        if (param === key) {
          vals[key] = currentUrl.searchParams.get(key);
        }
      }
    }
  }

  var els = document.querySelectorAll(selector);
  for (var i = 0, el; el = els[i]; i++) {
    var href = el.getAttribute(attr);
    if (href && !href.startsWith('#')) {
      var url = new URL(el.getAttribute(attr), currentUrl);
      for (key in vals) {
        url.searchParams.set(key, vals[key]);
      }
      el.setAttribute(attr, url.toString());
    }
  }
}


module.exports = {
  getParameterValue: getParameterValue,
  updateParamsFromUrl: updateParamsFromUrl
};
