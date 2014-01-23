Couchsurfer
===
Couchsurfer is a friendly utility that checks in with your couchdb to see if
your view indexes are up-to-date and trigger a re-indexing at the same time.
This is useful after deploying changes to your views.

## Installation

This is a [node.js](http://nodejs.org) utility, so you have to install node before you can run `couchsurfer`.

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

#### Examples

These are the same and will query all the design docs in `database` assuming
`user` is allowed to access this db.

```
couchsurfer -u user:secret http://couch:5984/database
couchsurfer http://user:secret@couch:5984/database
```

Query all the databases the user has access to. If you want to really query all
the databases in your couch, do this as an admin.

```
couchsurfer http://user:secret@couch:5984
```

Only query design docs in `foo` and `bar`

```
couchsurfer http://user:secret@couch:5984 -d foo -d bar
```

Look up registered users in `/_users` and then query their databases with
the respective name.

```
couchsurfer http://admin:secret@couch:5984 --byUsers
```

You can filter the design documents you want to query. Just specify a RegExp.

Only query ddocs whose names begin with `old_`
```
couchsurfer http://admin:secret@couch:5984 -f ^old_
```

Query everything except `lame_ddoc`
```
couchsurfer http://admin:secret@couch:5984 -f [^lame_ddoc]
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
