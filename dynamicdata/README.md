### dynamicdata

#### Concept

Binds the content of a DOM element to a value from a JSON file on a server.
This is intended to be used in conjunction with a background job that processes
data from a server, and regularly writes it to a JSON file to keep the content
in the file updated with the dynamic data source.

This supports two modes, `staging` and `prod`. In `staging`, the system
supports previewing values that may exist at some point in the future, by using
keys `start_date` and `end_date`.

In conjunction with a query parameter, the end user can preview values at
different dates.

If a `staging` key is not provided for a file, it will not be available.
`staging` keys are intended to be omitted from production HTML/JS and should
only be included for staging environments.

#### Sample usage

```markdown
# Sample data (i.e. in a Google Sheet).

| id | start_date | end_date | title |
| --- | --- | --- | --- |
| birthday | 2019-01-06 00:00 | 2019-01-07 00:00 | Jamie's birthday |
| birthday | 2019-04-16 00:00 | 2019-04-17 00:00 | Jennifer's birthday |
| birthday | 2019-09-27 00:00 | 2019-09-28 00:00 | Julie's birthday |
| color | | 2019-04-01 | purple |
| color | 2019-04-01 | 2019-08-01 | red |
| color | 2019-08-01 | | blue |
```

```
# Staging data file.
/data-backend/staging-123-456/promos.json

{
  "birthday": [
    {
      "id": "birthday",
      "start_date": "2019-01-06 00:00",
      "end_date": "2019-01-07 00:00",
      "title": "Jamie's birthday",
    },
    {
      "id": "birthday",
      "start_date": "2019-04-16 00:00",
      "end_date": "2019-04-17 00:00",
      "title": "Jennifer's birthday",
    },
    {
      "id": "birthday",
      "start_date": "2019-09-27 00:00",
      "end_date": "2019-09-28 00:00",
      "title": "Julie's birthday",
    }
  ],
  "color": [
    {
      "id": "color",
      "start_date": "",
      "end_date": "2019-04-01",
      "title": "purple"
    },
    {
      "id": "color",
      "start_date": "2019-04-01",
      "end_date": "2019-08-01",
      "title": "red"
    },
    {
      "id": "color",
      "start_date": "2019-08-01",
      "end_date": "",
      "title": "blue"
    }
  ]
}
```

```
# Prod data file (updated every minute, example 2019-04-16).
/data-backend/prod/promos.json

{
  "birthday": {
    "title": "Jennifer's birthday"
  },
  "color": {
    "title": "red"
  }
}
```

```javascript
var dynamicdata = require('airkit/dynamicdata');
dynamicdata.get({
  file: {
    id: 'promos',
    staging: 'https://data-backend.storage.googleapis.com/staging-123-456/promos.json'
    prod: 'https://data-backend.storage.googleapis.com/prod/promos.json'
  }
}).then(function(resp) {
  console.log('Birthday: ' + resp['birthday']['title']);
  console.log('Color: ' + resp['color']['title']);
});
```
