var datetoggle = require('../dates/datetoggle');
var objects = require('../utils/objects');
var uri = require('../utils/uri');


var defaultConfig = {
  applyCacheBuster: true,
  nowParameterName: 'ak-now',
  prodParameterName: 'ak-dynamicdata-prod'
};


var _cacheBuster = (new Date()).getTime();
var _xhrCache = _xhrCache || {};


function _xhr(url, cb) {
  if (url in _xhrCache) {
    return cb(_xhrCache[url]);
  }
  var req = new XMLHttpRequest();
  req.open('GET', url);
  req.addEventListener('load', function() {
    var text = req.responseText;
    var result = JSON.parse(text);
    _xhrCache[url] = result;
    cb(result);
  });
  req.send();
};


/**
 * Normalizes staging data to become the same format as prod data.
 */
function processStagingResp(resp, now) {
  var keysToData = {};
  for (var key in resp) {
    [].forEach.call(resp[key], function(datedRow) {
      var start =  datedRow['start_date'] ? new Date(datedRow['start_date']) : null;
      var end = datedRow['end_date'] ? new Date(datedRow['end_date']) : null;
      if (datetoggle.isEnabledNow(start, end, now)) {
        keysToData[key] = datedRow;
      }
    });
  }
  return keysToData;
}


function get(userConfig) {
  var config = objects.clone(defaultConfig);
  objects.merge(config, userConfig);
  var dateFromParam = uri.getParameterValue(config.nowParameterName);
  var now = dateFromParam ? new Date(dateFromParam) : new Date();
  var isProd = true;
  var isProdFromParam = uri.getParameterValue(config.prodParameterName);
  var file = config['file'];
  var url = file['prod'];
  if (!isProdFromParam && 'staging' in file) {
    isProd = false;
    url = file['staging'];
  }
  if (config.applyCacheBuster) {
    url = url + '?cb=' + _cacheBuster;
  }
  return new Promise(function(resolve, reject) {
    _xhr(url, function(resp) {
      if (!isProd) {
        resp = processStagingResp(resp, now);
      }
      resolve(resp);
    });
  });
}


module.exports = {
  get: get
};
