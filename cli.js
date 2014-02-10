#!/usr/bin/env node

var couchsurfer = require('./')
var dashdash = require('dashdash')
var cliopts = require('./cli-opts.json')
require('colors')


var parser = dashdash.createParser({ options: cliopts })
try {
  var opts = parser.parse(process.argv)
} catch (e) {
  console.error('view-pinger: error: %s', e.message)
  process.exit(1)
}

if (opts.version) {
  console.log(require('./package.json').version)
  process.exit(0)
}

if (opts.help || !opts._args[0]) {
  var help = parser.help({ includeEnv: true }).trimRight()
  console.log('usage: couchsurfer [OPTIONS] http[s]://[user:name@]couch_url:port[/database]\n')
  console.log('If no database is specified in the URL couchsurfer will iterate over all\nnon-system databases accessible to the given user (or the public).\n')
  console.log('options:\n' + help)
  process.exit(0)
}

opts.url = opts._args[0]
var surfer = couchsurfer(opts)

var log = console.log
if (opts.silent) log = function () {}

surfer.on('end', function() {
  log('DONE'.green)
})

surfer.on('ddoc', function (data) {
  var p = [ '', data.db.blue, '_design', data.ddoc, ].join('/')
  var time = data.time + 's'
  if (data.time > 100) {
    var minutes = Math.floor(data.time / 60)
    var seconds = parseInt(data.time - minutes * 60)
    time = minutes + 'min' + seconds + 's'
  }
  log('built'.green, p, 'in', time.yellow)
})

surfer.on('cleanup', function (err, db) {
  if (err) return log('couldn\'t clean up views in %s: %s', db, err)
  log('cleaned up views in ' + db.blue)
})

surfer.on('error', function (err) {
  console.error(err)
  process.exit(1)
})