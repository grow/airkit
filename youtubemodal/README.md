### youtubemodal

Plays a YouTube video in a modal dialog.

#### Sample usage

JS

```javascript
var youtubemodal = require('airkit/youtubemodal');
youtubemodal.init();
```

HTML

```html
<!-- Default. -->
<button data-ak-youtubemodal-video-id="{{video_id}}">Play</button>

<!-- With options. -->
<button
  data-ak-youtubemodal-video-id="{{video_id}}"
  data-ak-youtubemodal-video-start-seconds="3"
  data-ak-youtubemodal-attribution="Subscription required."
  >Play</button>
```

Sass

See [youtubemodal.sass](youtubemodal.sass) for an example Sass structure.

#### Configuration options

Option | Default | Description
------ | ------- | -----------
className | ak-youtubemodal | Class name to use for Sass and data-* attributes.
history | false | Whether to enable closing the modal with the browser back button (and thus also updating the browser history state).
historyNamePrefix | video: | If history is true, this is the value to prefix the state in the location hash.
parentSelector | body | Selector for a parent element to add YouTube DOM and scripts in.
playerVars | (object) | [YouTube playerVars](https://developers.google.com/youtube/player_parameters#Parameters) parameters.
transitionDuration | 300 | How long (in ms) to spend on the open/close transition.
useHandlerOnMobile | true | Whether to open the video in a new tab, allowing mobile devices that intercept YouTube URLs to use the native player.
