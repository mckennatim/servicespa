var express = require('express');
var cons = require('tracer').console();
var conn = require('../../db/mysqldb')
// var bearerTokenApp = require('../regtokau/strategy').bearerTokenApp
var bearerTokenCoid = require('../regtokau/strategy').bearerTokenCoid

var router = express.Router();
function addAppId(req,res,next){
    req.appid = 'jobs'
    next()
  }
module.exports = function() {
    router.get('/', function(req, res) {
        res.jsonp({ message: "in root of jobs module" })
    });
    router.get('/settings', addAppId, bearerTokenCoid, function(req, res){
      if (!req.userTok.auth) {
          var mess = { message: 'in get /jobs/settings (not authorized)-' + req.userTok.message }
          cons.log(mess)
          res.jsonp(mess)
      } else {
          var query = conn.query('SELECT * FROM `timecards`.`cosr` WHERE effective < CURDATE() AND coid =? ORDER BY effective DESC LIMIT 1 ', req.userTok.coid, function(error, settings) {
              cons.log(query.sql)
              cons.log(error)
              res.jsonp(settings)
          })
      }
    })
    router.put('/update', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /jobs/update (not authorized)-' + req.userTok.message }
            res.jsonp(mess)
        } else {
            mess = { message: 'nothing happenning yet-' }
            const job = req.body.jobs[0].job
            const keys = Object.keys(req.body.jobs[0]).join()+',coid'
            const vals = [req.body.jobs.map((j) => {
                let anarr = Object.values(j)
                anarr.push(req.userTok.coid)
                return anarr
            })]
            cons.log('keys: ', keys)
            cons.log('vals: ', vals)
            const upddel = conn.query('DELETE FROM jobcatact WHERE job=? AND coid=? AND week=0', [job, req.userTok.coid], function(err0) {
                cons.log('upddel.sql: ', upddel.sql)
                cons.log('err0: ', err0)
                const updins = conn.query('INSERT INTO jobcatact (' + keys + ') VALUES ? ', vals, function(err) {
                    cons.log('updins.sql: ', updins.sql)
                    cons.log('err: ', err)
                    res.jsonp({mess, err:err})
                })
            })
        }
    });
    router.put('/ck', addAppId, bearerTokenCoid, function(req,res){
        if (!req.userTok.auth) {
            var mess = { message: 'in get /jobs/update (not authorized)-' + req.userTok.message }
            res.jsonp(mess)
        } else {
            if(req.body.job.week>0){
                const ckq = conn.query('DELETE FROM jobcatact WHERE id = ?', req.body.job.id, function(){
                    cons.log('ckq.sql: ', ckq.sql)
                    res.jsonp({message: 'done,I hope'})
                })
            }else{
                const ckq = conn.query('UPDATE jobcatact SET active = ? WHERE id = ?',[req.body.job.active, req.body.job.id], function(){
                    cons.log('ckq.sql: ', ckq.sql)
                    res.jsonp({message: 'done,I hope'})
                })
            }
        }
    })
    router.get('/list/:wk', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /jobs/list/:wk (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            cons.log(req.userTok);
            cons.log(req.params)
            var q = conn.query('SELECT * FROM jobcatact WHERE week=? AND coid=? ORDER BY idx, category; UPDATE `jobcatact` SET active= 0 where coid = ? AND week= 0;' , [req.params.wk * 1, req.userTok.coid, req.userTok.coid], function(error, results) {
                cons.log(q.sql)
                var arrres = results[0].map((res) => res)
                // console.log('arrres: ', arrres)
                arrres.map((a)=>{
                    const q2 = conn.query("UPDATE jobcatact SET active = 1 WHERE week=0 AND job = ? AND category =?", [a.job, a.category], function() {
                        console.log('q2.sql: ', q2.sql)
                    })
                })
                res.jsonp({ jobs: arrres, binfo: req.userTok })
            })
        }
    })
  router.get('/list/:wk/:yr', addAppId, bearerTokenCoid, function(req, res) {
    if (!req.userTok.auth) {
      var mess = { message: 'in get /jobs/list/:wk/:yr (not authorized)-' + req.userTok.message }
      cons.log(mess)
      res.jsonp(mess)
    } else {
      cons.log(req.userTok);
      cons.log(req.params)
      var q = conn.query('SELECT job, category, active FROM jobcatact WHERE week=? AND `year`=? AND coid=? ORDER BY idx, category; ' , [req.params.wk * 1, req.params.yr, req.userTok.coid], function(error, results) {
        cons.log(q.sql)
        cons.log(results)
        let tjobs = results
        if(tjobs.length ==0){//USE DEFAULT JOBS
          var q5 = conn.query( 'SELECT job,categories,`default`,defcat FROM jobs WHERE coid=? AND archived=0 ORDER BY job;' , [req.userTok.coid], function(error, results) {
            // console.log('error: ', error)
            console.log(q5.sql)
            const djobs = results.reduce((acc,r)=>{
              if (r.default==1){
                const rec = {job:r.job, category:''}
                acc.push(rec)
              }
              if (r.defcat==1){
                const catarr = JSON.parse(r.categories)
                catarr.map((c,i)=>{
                  if(c.def){
                    acc.push({job:r.job, category:c.cat})
                  }
                })
              }
              return acc
            },[])
            console.log('djobs: ', djobs)
            res.jsonp({ jobs: djobs, binfo: req.userTok })
          })
        } else{
          res.jsonp({ jobs: tjobs, binfo: req.userTok })
        }                
      })
    }
  })

 
  router.get('/list', addAppId, bearerTokenCoid, function(req, res) {
    if (!req.userTok.auth) {
      var mess = { message: 'in get /jobs/list (not authorized)-' + req.userTok.message }
      cons.log(mess)
      res.jsonp(mess)
    } else {
      cons.log(req.userTok);
      cons.log(req.params)
      var q = conn.query( 'SELECT job,categories,`default`,defcat, jobwoCat FROM jobs WHERE coid=? AND archived=0 ORDER BY job;' , [req.userTok.coid], function(error, results) {
        console.log(q.sql)
        const djobs = results.reduce((acc,r)=>{
          const catarr = JSON.parse(r.categories)
          if (r.jobwoCat){
            const rec = {job:r.job, category:'', default:r.default}
            acc.push(rec)
          }
          if(catarr.length>0){
            catarr.map((c)=>{
              acc.push({job:r.job, category:c.cat, default:c.def})
            })
          }
          return acc
        },[])
        res.jsonp({ jobs: djobs, binfo: req.userTok })
      })
    }
  })   

  router.put('/ajob', addAppId, bearerTokenCoid, function(req, res) {
    if (!req.userTok.auth) {
      var mess = { message: 'in get /jobs/ajob (not authorized)-' + req.userTok.message }
      cons.log(mess)
      res.jsonp(mess)
    } else {
      cons.log(req.userTok);
      cons.log(req.body)
      var q = conn.query('SELECT job, cat, someid as employee, somenum as hrs , wdprt  FROM gl WHERE account = "a5010-COGS" AND coid =? AND job=? ORDER BY wdprt DESC,someid; SELECT * FROM `jobs`where JOB=? AND coid =?;', [req.userTok.coid, req.body.job, req.body.job, req.userTok.coid], function(error, results) {
        console.log(q.sql)
        const bid = results[1][0]
        bid.startdate = bid.startdate.toISOString().split('T')[0]
        bid.enddate = bid.enddate.toISOString().split('T')[0]
        delete bid.id
        console
        res.jsonp({ costs:results[0], bid:bid, binfo: req.userTok })
      })
    }
  })   

  router.put('/job', addAppId, bearerTokenCoid, function(req, res) {
    if (!req.userTok.auth) {
      var mess = { message: 'in get /jobs/job (not authorized)-' + req.userTok.message }
      cons.log(mess)
      res.jsonp(mess)
    } else {
      cons.log(req.userTok);
      cons.log(req.body)
      var q = conn.query( 'SELECT job,categories,hrs,labor,archived,`default`,defcat,jobwoCat FROM jobs WHERE coid=? AND job=?;' , [req.userTok.coid, req.body.job], function(error, results) {
        console.log(q.sql)
        console.log('results[0]: ', results[0])
        res.jsonp({ job: results[0], binfo: req.userTok })
      })
    }
  }) 
  
  router.post('/job', addAppId, bearerTokenCoid, function(req, res) {
    if (!req.userTok.auth) {
      var mess = { message: 'in get /jobs/job (not authorized)-' + req.userTok.message }
      cons.log(mess)
      res.jsonp(mess)
    } else {
      cons.log(req.userTok);
      cons.log(req.body)
      req.body.coid=req.userTok.coid
      var q = conn.query( 'INSERT INTO jobs SET ? ON DUPLICATE KEY UPDATE ?', [req.body, req.body], function(error, results) {
        console.log(q.sql)
        console.log('results: ', results)
        res.jsonp({ job: results, binfo: req.userTok })
      })
    }
  })

    router.post('/post/:wk/:yr', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in post :/wk/:yr (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            mess = { message: 'nothing happenning yet-' }
            const week = req.params.wk * 1
            const year = req.params.yr
            cons.log(req.body)
            const keys = Object.keys(req.body.jobs[0]).join()+',coid'
            const vals = [req.body.jobs.map((j) => {
                let anarr = Object.values(j)
                anarr.push(req.userTok.coid)
                return anarr
            })]
            console.log(keys);
            console.log(vals);
            var query1 = conn.query('DELETE FROM jobcatact WHERE week=? AND year=? AND coid=?', [week, year, req.userTok.coid], function(error, results) {
                cons.log(query1.sql)
                cons.log(error)
                cons.log(results)
                var query = conn.query('INSERT INTO jobcatact (' + keys + ') VALUES ? ', vals, function(error, results) {
                    cons.log(query.sql)
                    cons.log(error)
                    cons.log(results)
                    cons.log(mess)
                    res.jsonp(mess)
                })
            })
        }
    })
    router.delete('/del', addAppId, bearerTokenCoid, function(req, res) {
        if (!req.userTok.auth) {
            var mess = { message: 'in get /jobs/list (not authorized)-' + req.userTok.message }
            cons.log(mess)
            res.jsonp(mess)
        } else {
            mess = { message: 'nothing happenning yet-' }
            cons.log(req.body)
            const job = req.body.job
            var query1 = conn.query('DELETE FROM jobcatact WHERE job=? AND coid=? AND week=0', [job, req.userTok.coid], function(error, results) {
                cons.log(query1.sql)
                cons.log(error)
                cons.log(results)
                res.jsonp(mess)
            })
        }
    })
    return router
}