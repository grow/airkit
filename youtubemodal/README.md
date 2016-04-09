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

```sass
$color-black: #000
$color-white: #fff

.ak-youtubemodal
  display: none
  height: 100%
  left: 0
  opacity: 0
  position: fixed
  top: 0
  transition: all .3s cubic-bezier(.4,0,.2,1)
  transform: scale(1.15)
  visibility: hidden
  width: 100%
  z-index: 2000

  &--enabled
    display: block

  &--visible
    opacity: 1
    transform: scale(1)
    visibility: visible

  &-x
    background: $color-black
    color: $color-white
    cursor: pointer
    font-size: 50px
    height: 50px
    line-height: 50px
    opacity: 0.8
    overflow: hidden
    position: absolute
    right: 0
    text-align: center
    top: 0
    transition: all .3s
    width: 50px
    z-index: 2004

    &:before
      content: "\00D7"
      display: block
      font-family: 'arial', sans-serif
      height: 50px
      line-height: 50px
      text-align: center
      vertical-align: middle
      width: 50px

    &:hover
      color: $color-black
      background: $color-white

  &-mask
    background: #fff
    height: 100%
    left: 0
    position: absolute
    top: 0
    width: 100%
    z-index: 2001

  &-player
    height: 100%
    position: relative
    width: 100%
    z-index: 2002
```

#### Configuration options

Option | Default | Description
------ | ------- | -----------
useHandlerOnMobile | true | Whether to open the video in a new tab, allowing mobile devices that intercept YouTube URLs to use the native player.
transitionDuration | 300 | How long (in ms) to spend on the open/close transition.
className | ak-youtubemodal | Class name to use for Sass and data-* attributes.
playerVars | (object) | [YouTube playerVars](https://developers.google.com/youtube/player_parameters#Parameters) parameters.
