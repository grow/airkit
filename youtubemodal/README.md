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
<button data-ak-youtubemodal-video-id="{{video_id}}">Play</button>
```

Sass

See [youtubemodal.sass](youtubemodal.sass) for an example Sass structure.

#### Configuration options

Option | Default | Description
------ | ------- | -----------
useHandlerOnMobile | true | Whether to open the video in a new tab, allowing mobile devices that intercept YouTube URLs to use the native player.
transitionDuration | 300 | How long (in ms) to spend on the open/close transition.
className | ak-youtubemodal | Class name to use for Sass and data-* attributes.
playerVars | (object) | [YouTube playerVars](https://developers.google.com/youtube/player_parameters#Parameters) parameters.
