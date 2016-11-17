## scrolldelegator

Utility functions for scrolling.

### depth

Calls a function whenever a scroll depth is reached. Typical use cases involve
analytics tracking (e.g. to send analytics tracking events when users have
reached a certain scroll depth.

#### Sample usage

```javascript
// Generic example.
var depth = require('airkit/scrolldelegator/depth');

var callback = function(percentage, yPosition) {
  console.log('Reached %: ', percentage);
  console.log('Reached Y: ', yPosition);
};

depth.init(callback);
```

```javascript
// Google Analytics Event Tracking example.
var depth = require('airkit/scrolldelegator/depth');

var track = function(percentage) {
  var label = percentage + '%';
  var value = percentage;
  ga('send', 'event', ['Engagement'], ['Scroll Percentage'], [label], [value]);
};

depth.init(track);
```
