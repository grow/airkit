var objects = require('../utils/objects');
var uri = require('../utils/uri');


var defaultConfig = {
  nowParameterName: 'ak-now',
  prodParameterName: 'ak-dynamicdata-prod'
};


function _get(url, cb) {
  var req = new XMLHttpRequest();
  req.open('GET', url);
  req.addEventListener('load', function() {
    var text = req.responseText;
    cb(JSON.parse(text));
  });
  req.send();
};


function processElements(fileKey, resp) {
  var selector = '[data-ak-dynamicdata-file="' + fileKey + '"]';
  var els = document.querySelectorAll(selector);
  [].forEach.call(els, function(el) {
    var parts = el.getAttribute('data-ak-dynamicdata-id');
    parts = parts.split('.');
    key = parts[0];
    value = parts[1];
    el.innerHTML = resp[key][value];
  });
}


function processFile(fileKey, url, isProd, now) {
  // TODO: Implement XHR to url, normalize the data (based on `now` if not
  // `isProd`), then analyze all the elements matching fileKey,
  // determine if the id of the element is present in the data file, and then
  // set the innerHTML of the matching elements to the corresponding value in
  // the data file.
  _get(url, function(resp) {
    processElements(fileKey, resp);
  });
}


function init(userConfig) {
  var config = objects.clone(defaultConfig);
  objects.merge(config, userConfig);
  var files = config['files'];

  var dateFromParam = uri.getParameterValue(config.nowParameterName);
  var now = dateFromParam ? new Date(dateFromParam) : new Date();
  var isProd = true;
  var isProdFromParam = uri.getParameterValue(config.prodParameterName);

  console.log(config);

  for (var fileKey in files) {
    var url = files[fileKey]['prod'];
    if (!isProdFromParam && 'staging' in files[fileKey]) {
      isProd = false;
      url = files[fileKey]['staging'];
    }
    url = url + '?cb=' + (new Date()).getTime();
    processFile(fileKey, url, isProd, now);
  }
}


module.exports = {
  init: init
};
