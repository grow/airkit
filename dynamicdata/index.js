var datetoggle = require('../dates/datetoggle');
var objects = require('../utils/objects');
var uri = require('../utils/uri');


var defaultConfig = {
  nowParameterName: 'ak-now',
  prodParameterName: 'ak-dynamicdata-prod'
};


function _xhr(url, cb) {
  var req = new XMLHttpRequest();
  req.open('GET', url);
  req.addEventListener('load', function() {
    var text = req.responseText;
    cb(JSON.parse(text));
  });
  req.send();
};


function processStagingResp(resp, now) {
  var keysToData = {};
  for (var key in resp) {
    [].forEach.call(resp[key], function(datedRow) {
      var start =  new Date(datedRow['start_date']);
      var end = new Date(datedRow['end_date']);
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
  url = url + '?cb=' + (new Date()).getTime();
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
