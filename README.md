Couchsurfer
===
Queries your design documents to trigger view rebuilds.

## Installation

```
npm install couchsurfer [-g]
```

## Usage

### Command Line

```
usage: couchsurfer [OPTIONS] http[s]://[user:name@]couch_url:port[/database]

If no database is specified in the URL couchsurfer will iterate over all
non-system databases accessible to the given user (or the public).

options:
    -u user:pass, --user=user:pass  Couchsurf as the given user (can also be
                                    specified in the URL).
    -d db_name, --dbs=db_name       Only query the given databases.
    --byUsers                       Iterate over the dbs of users in '/_users'.
    -f regex, --filter=regex        RegExp to filter the ddoc names.
    -s, --silent                    Don't log progress, just errors.
    --version                       Print couchsurfer version and exit.
    -h, --help                      Print this help and exit.
```

### Node Module

Couchsurfer is an event emitter.

```javascript
var couchsurfer = require('couchsurfer')

var surfer = couchsurfer({ url: 'http://foo:5984', ... })

surfer.on('error', console.error)

surfer.on('end', function () {
  console.log('yay! done!')
})

// emitted every time a ddoc has been rebuild
surfer.on('ddoc', function (info) {
  // db name, ddoc name and the time it took to rebuild
  console.log(info.db, info.ddoc, info.time)
})

// emitted every time a view cleanup happened
surfer.on('cleanup', function (err, db) {
  // yes, it's weird to use the "(err, result)" pattern here
  if (err) return console.log('couldn\'t clean up views in %s: %s', db, err)
  console.log('cleaned up views in ' + db)
})
```
