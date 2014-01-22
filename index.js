
var nano = require('nano'),
    async = require('async'),
    EventEmitter = require('events').EventEmitter,
    url = require('url')

// TODO
// dry-run
// get config from elsewhere

module.exports = function (opts) {
  var u = url.parse(opts.url)
  if (opts.user && !u.auth) u.auth = opts.user

  var dbName
  
  if (u.pathname) {
    dbName = u.pathname.replace(/^\//, '').split('/')[0]
    delete u.pathname
  }
  u = url.format(u)

  var couch = nano(u)
  var emitter = new EventEmitter()

  // one db in the url
  if (dbName) {
    process.nextTick(function () {
      queryDb(couch.use(dbName), dbName, done)
    })
    return emitter
  }

  // multiple dbs
  if (opts.dbs) {
    process.nextTick(function () {
      async.each(opts.dbs, function (user, cb) {
        queryDb(couch.use(user), user, cb)
      }, done)
    })
    return emitter
  }

  if (opts.byUsers) {
    process.nextTick(function () {
      couch.use('_users').list(function (err, res) {
        if (err) return emitter.emit('error', err)
        var users = res.rows.filter(function (row) {
          return !(/_design/.test(row.id))
        }).map(function (row) {
          return row.id.split(':')[1]
        })

        async.each(users, function (user, cb) {
          queryDb(couch.use(user), user, cb)
        }, done)
      })
    })
    
    return emitter
  }

  // all_dbs
  process.nextTick(function () {
    couch.db.list(function (err, dbs) {
      if (err) return emitter.emit('error', err)
      dbs = dbs.filter(function (name) { return !(/^_/.test(name)) })
      async.each(dbs, function (db, cb) {
        queryDb(couch.use(db), db, cb)
      }, done)
    })
  })
      

  function queryDb (db, name, cb) {
    db.list({ startkey: "_design", endkey: "_designZZZ" }, function (err, ddocs) {
      if (err) return cb()
      ddocs = ddocs.rows.map(function (row) { return row.id })

      if (opts.filter) {
        var re = new RegExp(opts.filter)
        ddocs = ddocs.filter(function (ddoc) {
          return re.test(ddoc.split('/')[1])
        })
      }
      
      // ddocs
      async.each(ddocs, function (id, cb2) {
        var doc = id.split('/')[1]
        
        db.get(id, function (err, ddoc) {
          if (err) return cb2()
          var views = Object.keys(ddoc.views).filter(function (v) {
            return v !== 'lib'
          })
          var start = Date.now()
          db.view(doc, views[0], { limit: 1 }, function (err) {
            if (err) return cb2()
            var t = ((Date.now() - start) / 1000).toFixed(2)
            emitter.emit('ddoc', {
              db: name,
              ddoc: doc,
              time: t
            })
            cb2()
          })
        })
      }, function dbDone (err) {
        if (err) return cb(err)
        couch.relax({ db: name, method: 'post', path: '_view_cleanup' }, function (err) {
          emitter.emit('cleanup', err, name)
          cb()
        })
      })
    })
  }

  function done (err) {
    if (err) return emitter.emit('error', err)
    emitter.emit('end')
  }
  return emitter
}