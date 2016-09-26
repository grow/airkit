## ui

Utility functions for working with the display of elements and styles.

### createStyle

Creates a style element and inserts it into the document head.

#### Sample usage

JS

```javascript
var ui = require('airkit/ui');
ui.createStyle({
  'body': {
      'font-weight': 'bold',
      'color': 'red'
  },
  'div.hero': {
      'font-size': '20px'
  }
});
```

### inview.addClassInView

Adds a class to elements when they come into the viewport, optionally applying
an offset and a randomized delay.

#### Sample usage

HTML

```html
<div class="ak-in-view--start">
  Element 1
</div>
<div class="ak-in-view--start">
  Element 2
</div>
```

JS

```javascript
<script>
  var inview = require('airkit/ui/inview');
  inview.addClassInView({
    selector: '.ak-in-view--start',
    className: 'ak-in-view--end',
    offset: 0.85,
    delay: [200, 500]
  });
</script>
```

### inview.playVideoInView

Loads videos and plays them when they come into the viewport, optionally
applying an offset and a randomized delay.

#### Sample usage

HTML

```html
<video class="ak-in-view" preload="auto">
  <source src="video.mp4" type="video/mp4">
</div>
```

JS

```javascript
<script>
  var inview = require('airkit/ui/inview');
  inview.playVideoInView();
</script>
```
