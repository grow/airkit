## dates

### datetoggle

Conditionally displays elements based on the date. By default, elements are
hidden by a style written by the datetoggle module. Once initialized, elements
that should be displayed are displayed by removing the attribute whose style
hides the element.

You can override the current date to test behavior by using a query parameter.
For example, `?ak-now=1/1/2016` will cause datetoggle to perform as if the date
is 1/1/2016.

#### Sample usage

```javascript
var datetoggle = require('airkit/dates/datetoggle');
datetoggle.init();
```

```html
<div
    data-ak-datetoggle
    data-ak-datetoggle-start="1/1/2017">
  Displayed only on or after 1/1/2017.
</div>

<div
    data-ak-datetoggle
    data-ak-datetoggle-start="1/1/2017"
    data-ak-datetoggle-end="2/1/2017">
  Displayed only on or after 1/1/2017 and before 2/1/2017.
</div>

<div
    data-ak-datetoggle
    data-ak-datetoggle-end="2/1/2017">
  Displayed only before 2/1/2017.
</div>
```

#### Configuration options

Example

```javascript
datetoggle.init({
  parameterName: 'data-ak-datetoggle',
  attributeName: 'data-ak-now'
});
```

Option | Default | Description
------ | ------- | -----------
attributeName | data-ak-datetoggle | Attribute used to decorate toggled elements.
parameterName | ak-now | Key of the query parameter to use to mock the current date.
