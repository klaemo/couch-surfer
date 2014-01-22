Couchsurfer
===

```
usage: couchsurfer [OPTIONS] http[s]://[user:name@]couch_url:port[/database]

If no database is specified in the URL couchsurfer will iterate over all
non-system databases accessible to the given user (or the public).

options:
    -u user:pass, --user=user:pass  Couchsurf as the given user (can also be
                                    specified in the URL).
    --byUsers                       Iterate over the dbs of users in '/_users'.
    -f, --filter                    RegExp to filter the ddoc names.
    -s, --silent                    Don't log progress, just errors.
    -c, --clean                     '-c false' prevents the view cleanup from
                                    being run.
    --version                       Print couchsurfer version and exit.
    -h, --help                      Print this help and exit.
```